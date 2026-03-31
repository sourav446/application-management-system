import Applicant from "../models/Applicant.js";
import Program from "../models/Program.js";

export const allocateSeat = async (applicantId) => {
  const applicant = await Applicant.findById(applicantId);
  if (!applicant) {
    throw new Error("Application not found");
  }

  if (applicant.admissionStatus !== "PENDING") {
    throw new Error("Already processed");
  }

  const program = await Program.findById(applicant.programId);
  if (!program) {
    throw new Error("Program not found");
  }

  const quota = applicant.quotaType;
  if (program.filledSeats[quota] >= program.quotas[quota]) {
    throw new Error("Quota Full");
  }

  program.filledSeats[quota] += 1;
  applicant.admissionStatus = "ALLOCATED";

  await program.save();
  await applicant.save();

  return Applicant.findById(applicant._id).populate("programId", "name quotas filledSeats");
};

