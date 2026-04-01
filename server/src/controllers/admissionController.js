import Applicant from "../models/Applicant.js";
import Program from "../models/Program.js";
import { allocateSeat } from "../services/seatAllocationService.js";
import { confirmAdmission } from "../services/admissionService.js";
import { buildPagination, buildPaginationResponse } from "../utils/pagination.js";

export const getAdmissions = async (req, res, next) => {
  try {
    const {
      quotaType = "all",
      programId = "all",
      admissionStatus = "all",
      programType = "all"
    } = req.query;
    const { page, limit, skip } = buildPagination(req.query);
    const filters = {};

    if (quotaType !== "all") {
      filters.quotaType = quotaType;
    }

    if (admissionStatus !== "all") {
      filters.admissionStatus = admissionStatus;
    }

    let programIds = null;

    if (programType !== "all") {
      const matchingPrograms = await Program.find({ programType }).select("_id").lean();
      programIds = matchingPrograms.map((program) => String(program._id));
    }

    if (programId !== "all") {
      programIds = programIds ? programIds.filter((id) => id === programId) : [programId];
    }

    if (programIds) {
      filters.programId = { $in: programIds };
    }

    const [admissions, totalItems] = await Promise.all([
      Applicant.find(filters)
        .populate("programId", "name programType branch quotas filledSeats")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Applicant.countDocuments(filters)
    ]);

    res.status(200).json({
      items: admissions,
      pagination: buildPaginationResponse({ totalItems, page, limit })
    });
  } catch (error) {
    next(error);
  }
};

export const allocateAdmissionSeat = async (req, res, next) => {
  try {
    const applicant = await allocateSeat(req.params.applicantId);
    res.status(200).json(applicant);
  } catch (error) {
    next(error);
  }
};

export const confirmApplicantAdmission = async (req, res, next) => {
  try {
    const applicant = await confirmAdmission(req.params.applicantId);
    res.status(200).json(applicant);
  } catch (error) {
    next(error);
  }
};
