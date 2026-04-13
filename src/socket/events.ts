import { Server, Socket } from "socket.io";
import { SensorService } from "../app/sensor_info/sensor_info.service";
import { SittingService } from "../app/sittings/sittings.service";
import { ESP_32_INFO } from "../interface";

//    GLOBAL STATE (IN MEMORY)
let MOTOR_MODE: "AUTO" | "MANUAL" = "MANUAL";
let MANUAL_MOTOR_STATE: "ON" | "OFF" | null = null;
let LAST_MANUAL_STATE: "ON" | "OFF" | null = null;
let LAST_AUTO_STATE: boolean | null = null;
const DRY = 30;
const WET = 60;
let CURRENT_SENSOR: ESP_32_INFO | null = null; // LATEST DATA FROM SENSOR

let activeSession: {
  start: ESP_32_INFO;
  motorStart: Date;
} | null = null; // FOR SNAPSHORT

//    LOAD INITIAL MODE FROM DB
async function initMotorMode() {
  MOTOR_MODE = await SittingService.getMotorModeFromDB();
  console.log("Motor mode loaded:", MOTOR_MODE);
}

initMotorMode();

// SOCKET EVENTS
export async function socketEvents(socket: Socket, io: Server) {
  //   USER MODE CHANGE
  socket.on("motor-mode:update", async (mode: "AUTO" | "MANUAL") => {
    // RESET STATES ON MODE CHANGE
    if (mode === "AUTO") {
      MANUAL_MOTOR_STATE = null;
      LAST_MANUAL_STATE = null;
      LAST_AUTO_STATE = null;
    }

    const motor_mode = await SittingService.updateMotorMode(mode);
    MOTOR_MODE = motor_mode ?? "MANUAL";
    if (MOTOR_MODE === "MANUAL") {
      LAST_AUTO_STATE = null;
    }

    io.emit("app-motor-mode", motor_mode);
  });

  // SEND APP MOTOR MODE
  socket.emit("app-motor-mode", MOTOR_MODE);

  //   MANUAL MOTOR CONTROL
  socket.on("app-motor-state", (state: "ON" | "OFF" | null) => {
    MANUAL_MOTOR_STATE = state;
    io.emit("app-motor-state", MANUAL_MOTOR_STATE);
    console.log("Manual motor state:", MANUAL_MOTOR_STATE);
  });

  //   SENSOR DATA STREAM
  socket.on("sensor-info", async (data: ESP_32_INFO) => {
    CURRENT_SENSOR = data;
    io.emit("live-info", data);

    //  AUTO MODE_________________________________________________
    if (MOTOR_MODE === "AUTO") {
      // START MOTOR
      if (
        CURRENT_SENSOR &&
        CURRENT_SENSOR?.soilMoisture < DRY &&
        LAST_AUTO_STATE !== true
      ) {
        io.emit("esp-motor-state", true);

        activeSession = {
          start: { ...CURRENT_SENSOR }, // 🔥 snapshot lock
          motorStart: new Date(),
        };

        LAST_AUTO_STATE = true;
      }

      // STOP MOTOR + SAVE HISTORY
      if (
        CURRENT_SENSOR &&
        CURRENT_SENSOR?.soilMoisture > WET &&
        LAST_AUTO_STATE !== false &&
        activeSession
      ) {
        io.emit("esp-motor-state", false);

        try {
          await SensorService.storeSensorInformationToDB({
            soilMoistureStart: activeSession?.start?.soilMoisture,
            soilMoistureEnd: CURRENT_SENSOR?.soilMoisture,

            temperatureStart: activeSession?.start?.temperature,
            temperatureEnd: CURRENT_SENSOR?.temperature,

            humidityStart: activeSession?.start?.humidity,
            humidityEnd: CURRENT_SENSOR?.humidity,

            waterLevelStart: activeSession?.start?.waterLevel,
            waterLevelEnd: CURRENT_SENSOR?.waterLevel,

            motorStart: activeSession?.motorStart,
            motorOff: new Date(),
          });
        } catch (error) {
          console.log("Data not stored");
        }

        activeSession = null;
        LAST_AUTO_STATE = false;
      }
    }

    //  MANUAL MODE_____________________________________________________
    if (MOTOR_MODE === "MANUAL") {
      // TURN ON (manual)
      if (MANUAL_MOTOR_STATE === "ON" && LAST_MANUAL_STATE !== "ON") {
        io.emit("esp-motor-state", true);
        console.log("MANUAL MOTOR STATED");

        activeSession = {
          start: { ...CURRENT_SENSOR! },
          motorStart: new Date(),
        };

        LAST_MANUAL_STATE = "ON";
      }

      // TURN OFF (manual + save history)
      if (
        MANUAL_MOTOR_STATE === "OFF" &&
        LAST_MANUAL_STATE !== "OFF" &&
        activeSession
      ) {
        console.log("MANUAL MOTOR OFF");
        io.emit("esp-motor-state", false);
        console.log(activeSession);
        try {
          await SensorService.storeSensorInformationToDB({
            soilMoistureStart: activeSession?.start?.soilMoisture,
            soilMoistureEnd: CURRENT_SENSOR?.soilMoisture,

            temperatureStart: activeSession?.start.temperature,
            temperatureEnd: CURRENT_SENSOR?.temperature,

            humidityStart: activeSession?.start.humidity,
            humidityEnd: CURRENT_SENSOR?.humidity,

            waterLevelStart: activeSession?.start.waterLevel,
            waterLevelEnd: CURRENT_SENSOR?.waterLevel,

            motorStart: activeSession.motorStart,
            motorOff: new Date(),
          });
        } catch (error) {
          console.log("Data not stored");
        }

        activeSession = null;
        LAST_MANUAL_STATE = "OFF";
      }
    }
  });

  //   HISTORY API
  socket.on("history:request", async () => {
    try {
      const result = await SensorService.getMotorHistoryFromDB();

      socket.emit("history:response", {
        success: true,
        data: result,
      });
    } catch (err) {
      socket.emit("history:response", {
        success: false,
        message: "Failed to fetch history",
      });
    }
  });
}
