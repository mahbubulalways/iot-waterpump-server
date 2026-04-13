"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SittingService = void 0;
const sittings_model_1 = require("./sittings.model");
const getMotorModeFromDB = async () => {
    const result = await sittings_model_1.SittingModel.findOne({}).lean().select("motor_mode");
    return result?.motor_mode ?? "MANUAL";
};
const updateMotorMode = async (mode) => {
    const result = await sittings_model_1.SittingModel.updateOne({}, { motor_mode: mode });
    return mode ?? "MANUAL";
};
exports.SittingService = { getMotorModeFromDB, updateMotorMode };
