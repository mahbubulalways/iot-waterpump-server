"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketEvents = socketEvents;
const sensor_info_service_1 = require("../app/sensor_info/sensor_info.service");
const sittings_service_1 = require("../app/sittings/sittings.service");
//    GLOBAL STATE (IN MEMORY)
let MOTOR_MODE = "MANUAL";
let MANUAL_MOTOR_STATE = null;
let LAST_MANUAL_STATE = null;
let LAST_AUTO_STATE = null;
const DRY = 30;
const WET = 60;
let CURRENT_SENSOR = null; // LATEST DATA FROM SENSOR
let activeSession = null; // FOR SNAPSHORT
//    LOAD INITIAL MODE FROM DB
async function initMotorMode() {
    MOTOR_MODE = await sittings_service_1.SittingService.getMotorModeFromDB();
    console.log("Motor mode loaded:", MOTOR_MODE);
}
initMotorMode();
// SOCKET EVENTS
async function socketEvents(socket, io) {
    //   USER MODE CHANGE
    socket.on("motor-mode:update", async (mode) => {
        // RESET STATES ON MODE CHANGE
        if (mode === "AUTO") {
            MANUAL_MOTOR_STATE = null;
            LAST_MANUAL_STATE = null;
            LAST_AUTO_STATE = null;
        }
        const motor_mode = await sittings_service_1.SittingService.updateMotorMode(mode);
        MOTOR_MODE = motor_mode ?? "MANUAL";
        if (MOTOR_MODE === "MANUAL") {
            LAST_AUTO_STATE = null;
        }
        io.emit("app-motor-mode", motor_mode);
    });
    // SEND APP MOTOR MODE
    socket.emit("app-motor-mode", MOTOR_MODE);
    //   MANUAL MOTOR CONTROL
    socket.on("app-motor-state", (state) => {
        MANUAL_MOTOR_STATE = state;
        io.emit("app-motor-state", MANUAL_MOTOR_STATE);
        console.log("Manual motor state:", MANUAL_MOTOR_STATE);
    });
    socket.emit("live-info", {
        soilMoisture: 95,
        temperature: 30,
        humidity: 70,
        waterLevel: 60,
    });
    //   SENSOR DATA STREAM
    socket.on("sensor-info", async (data) => {
        CURRENT_SENSOR = data;
        io.emit("live-info2", data);
        //  AUTO MODE_________________________________________________
        if (MOTOR_MODE === "AUTO") {
            // START MOTOR
            if (CURRENT_SENSOR &&
                CURRENT_SENSOR?.soilMoisture < DRY &&
                LAST_AUTO_STATE !== true) {
                io.emit("esp-motor-state", true);
                activeSession = {
                    start: { ...CURRENT_SENSOR }, // 🔥 snapshot lock
                    motorStart: new Date(),
                };
                LAST_AUTO_STATE = true;
            }
            // STOP MOTOR + SAVE HISTORY
            if (CURRENT_SENSOR &&
                CURRENT_SENSOR?.soilMoisture > WET &&
                LAST_AUTO_STATE !== false &&
                activeSession) {
                io.emit("esp-motor-state", false);
                try {
                    await sensor_info_service_1.SensorService.storeSensorInformationToDB({
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
                }
                catch (error) {
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
                    start: { ...CURRENT_SENSOR },
                    motorStart: new Date(),
                };
                LAST_MANUAL_STATE = "ON";
            }
            // TURN OFF (manual + save history)
            if (MANUAL_MOTOR_STATE === "OFF" &&
                LAST_MANUAL_STATE !== "OFF" &&
                activeSession) {
                console.log("MANUAL MOTOR OFF");
                io.emit("esp-motor-state", false);
                console.log(activeSession);
                try {
                    await sensor_info_service_1.SensorService.storeSensorInformationToDB({
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
                }
                catch (error) {
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
            const result = await sensor_info_service_1.SensorService.getMotorHistoryFromDB();
            socket.emit("history:response", {
                success: true,
                data: result,
            });
        }
        catch (err) {
            socket.emit("history:response", {
                success: false,
                message: "Failed to fetch history",
            });
        }
    });
}
