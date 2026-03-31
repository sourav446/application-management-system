import Applicant from "../models/Applicant.js";
import Program from "../models/Program.js";

export const getDashboardStats = async (_req, res, next) => {
  try {
    const [
      activePrograms,
      pendingApplicants,
      allocatedApplicants,
      confirmedApplicants,
      totalPrograms,
      totalApplicants
    ] = await Promise.all([
      Program.countDocuments({ status: "active" }),
      Applicant.countDocuments({ admissionStatus: "PENDING" }),
      Applicant.countDocuments({ admissionStatus: "ALLOCATED" }),
      Applicant.countDocuments({ admissionStatus: "CONFIRMED" }),
      Program.countDocuments(),
      Applicant.countDocuments()
    ]);

    res.status(200).json({
      activePrograms,
      pendingApplicants,
      allocatedApplicants,
      confirmedApplicants,
      totalPrograms,
      totalApplicants
    });
  } catch (error) {
    next(error);
  }
};
