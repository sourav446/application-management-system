import mongoose from "mongoose";

const admissionSchema = new mongoose.Schema(
  {
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Applicant",
      required: true,
      unique: true
    },
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true
    },
    quota: {
      type: String,
      required: true,
      enum: ["KCET", "COMEDK", "MANAGEMENT"]
    },
    admissionNumber: {
      type: String,
      unique: true,
      sparse: true
    },
    status: {
      type: String,
      enum: ["Allocated", "Confirmed"],
      default: "Allocated"
    }
  },
  { timestamps: true }
);

const Admission = mongoose.model("Admission", admissionSchema);

export default Admission;
