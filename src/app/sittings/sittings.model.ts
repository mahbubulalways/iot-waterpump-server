import mongoose, { model } from "mongoose";
import { ISitting } from "./sittings.interface";

const SittingSchema = new mongoose.Schema<ISitting>(
  {
    motor_mode: {
      type: String,
      required: true,
      enum: ["AUTO", "MANUAL"],
    },
  },
  {
    timestamps: true,
  },
);

export const SittingModel = model<ISitting>("sittings", SittingSchema);
