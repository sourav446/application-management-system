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
    programType: {
      type: String,
      required: true,
      enum: ["UG", "PG"],
      trim: true,
      default: "UG"
    },
    branch: {
      type: [String],
      required: true,
      default: [],
      validate: {
        validator: (branches) => Array.isArray(branches) && branches.length > 0,
        message: "At least one branch is required"
      }
    },
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
