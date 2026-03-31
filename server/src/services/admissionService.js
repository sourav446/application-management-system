import Applicant from "../models/Applicant.js";
import Program from "../models/Program.js";
import generateAdmissionNumber from "../utils/generateAdmissionNumber.js";

export const confirmAdmission = async (applicantId) => {
  const applicant = await Applicant.findById(applicantId).populate("programId", "name");
  if (!applicant) {
    throw new Error("Application not found");
  }

  if (applicant.admissionStatus !== "ALLOCATED") {
    throw new Error("Seat not allocated");
  }

  if (applicant.documentsStatus !== "Verified") {
    throw new Error("Documents not verified");
  }

  if (applicant.feeStatus !== "Paid") {
    throw new Error("Fee not paid");
  }

  if (!applicant.admissionNumber) {
    const program = await Program.findById(applicant.programId._id || applicant.programId);
    if (!program) {
      throw new Error("Program not found");
    }

    applicant.admissionNumber = await generateAdmissionNumber({
      year: 2026,
      level: "UG",
      programName: program.name,
      quota: applicant.quotaType
    });
  }

  applicant.admissionStatus = "CONFIRMED";
  await applicant.save();

  return Applicant.findById(applicant._id).populate("programId", "name");
};

