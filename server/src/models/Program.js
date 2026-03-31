import mongoose from "mongoose";

const quotaSchema = new mongoose.Schema(
  {
    KCET: { type: Number, required: true, default: 0 },
    COMEDK: { type: Number, required: true, default: 0 },
    MANAGEMENT: { type: Number, required: true, default: 0 }
  },
  { _id: false }
);

const programSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    intake: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },
    quotas: { type: quotaSchema, required: true },
    filledSeats: {
      type: quotaSchema,
      default: () => ({
        KCET: 0,
        COMEDK: 0,
        MANAGEMENT: 0
      })
    }
  },
  { timestamps: true }
);

const Program = mongoose.model("Program", programSchema);

export default Program;
