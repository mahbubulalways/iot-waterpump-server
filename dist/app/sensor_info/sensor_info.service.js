"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SensorService = void 0;
const sensor_info_model_1 = require("./sensor_info.model");
const storeSensorInformationToDB = async (payload) => {
    try {
        console.log(payload);
        const result = await sensor_info_model_1.SensorInfoModel.create(payload);
        return result;
    }
    catch (error) {
        console.error("Error storing sensor info to DB:", error);
        throw error;
    }
};
const getMotorHistoryFromDB = async () => {
    const result = await sensor_info_model_1.SensorInfoModel.find({});
    return result;
};
exports.SensorService = {
    storeSensorInformationToDB,
    getMotorHistoryFromDB,
};
