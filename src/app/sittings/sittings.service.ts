import { SittingModel } from "./sittings.model";

const getMotorModeFromDB = async () => {
  const result = await SittingModel.findOne({}).lean().select("motor_mode");
  return result?.motor_mode ?? "MANUAL";
};

const updateMotorMode = async (mode: "AUTO" | "MANUAL") => {
  const result = await SittingModel.updateOne({}, { motor_mode: mode });
  return mode ?? "MANUAL";
};

export const SittingService = { getMotorModeFromDB, updateMotorMode };
