import mongoose, { model } from "mongoose";
import { ISensorInfo } from "./sensor_info.interface";

const SensorInfoSchema = new mongoose.Schema<ISensorInfo>(
  {
    soilMoistureStart: {
      type: Number,
      required: true,
    },
    soilMoistureEnd: {
      type: Number,
      required: true,
    },

    temperatureStart: {
      type: Number,
      required: true,
    },
    temperatureEnd: {
      type: Number,
      required: true,
    },

    humidityStart: {
      type: Number,
      required: true,
    },
    humidityEnd: {
      type: Number,
      required: true,
    },

    waterLevelStart: {
      type: Number,
      required: true,
    },
    waterLevelEnd: {
      type: Number,
      required: true,
    },

    motorStart: {
      type: Date,
      required: true,
    },

    motorOff: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const SensorInfoModel = model<ISensorInfo>(
  "SensorInfo",
  SensorInfoSchema,
);
