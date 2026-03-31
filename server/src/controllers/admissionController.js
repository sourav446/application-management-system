import Applicant from "../models/Applicant.js";
import { allocateSeat } from "../services/seatAllocationService.js";
import { confirmAdmission } from "../services/admissionService.js";
import { buildPagination, buildPaginationResponse } from "../utils/pagination.js";

export const getAdmissions = async (req, res, next) => {
  try {
    const {
      quotaType = "all",
      programId = "all",
      admissionStatus = "all"
    } = req.query;
    const { page, limit, skip } = buildPagination(req.query);
    const filters = {};

    if (quotaType !== "all") {
      filters.quotaType = quotaType;
    }

    if (programId !== "all") {
      filters.programId = programId;
    }

    if (admissionStatus !== "all") {
      filters.admissionStatus = admissionStatus;
    }

    const [admissions, totalItems] = await Promise.all([
      Applicant.find(filters)
        .populate("programId", "name quotas filledSeats")
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
