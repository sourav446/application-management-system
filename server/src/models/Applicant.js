import mongoose from "mongoose";

const applicantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    entryType: {
      type: String,
      required: true,
      enum: ["Regular", "Lateral"]
    },
    quotaType: {
      type: String,
      required: true,
      enum: ["KCET", "COMEDK", "MANAGEMENT"]
    },
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true
    },
    branch: { type: String, required: true, trim: true },
    marks: { type: Number, required: true, min: 0 },
    documentsStatus: {
      type: String,
      enum: ["Pending", "Submitted", "Verified"],
      default: "Pending"
    },
    feeStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending"
    },
    admissionStatus: {
      type: String,
      enum: ["PENDING", "ALLOCATED", "CONFIRMED"],
      default: "PENDING"
    },
    admissionNumber: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  { timestamps: true }
);

const Applicant = mongoose.model("Applicant", applicantSchema);

export default Applicant;
