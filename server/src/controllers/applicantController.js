import Applicant from "../models/Applicant.js";
import Program from "../models/Program.js";
import { buildPagination, buildPaginationResponse } from "../utils/pagination.js";

const confirmedMutationMessage = "Confirmed applications cannot be modified";

const validateApplicantPayload = (payload) => {
  const requiredFields = [
    "name",
    "phone",
    "category",
    "entryType",
    "quotaType",
    "programId",
    "marks"
  ];

  const missingField = requiredFields.find((field) => {
    const value = payload[field];
    return value === undefined || value === null || value === "";
  });

  if (missingField) {
    throw new Error(`${missingField} is required`);
  }
};

const normalizeApplicantPayload = (payload) => ({
  name: payload.name?.trim() || "",
  email: payload.email?.trim().toLowerCase() || "",
  phone: payload.phone?.trim() || "",
  category: payload.category,
  entryType: payload.entryType,
  quotaType: payload.quotaType,
  programId: payload.programId,
  marks: payload.marks
});

const checkDuplicateApplicantFields = async ({ programId, phone, email }) => {
  const duplicateErrors = {};

  if (phone?.trim()) {
    const existingPhoneApplication = await Applicant.findOne({
      programId,
      phone: phone.trim()
    });

    if (existingPhoneApplication) {
      duplicateErrors.phone = "Number already used";
    }
  }

  if (email?.trim()) {
    const existingEmailApplication = await Applicant.findOne({
      programId,
      email: email.trim().toLowerCase()
    });

    if (existingEmailApplication) {
      duplicateErrors.email = "Email id already exists";
    }
  }

  return duplicateErrors;
};

export const checkApplicantAvailability = async (req, res, next) => {
  try {
    const { programId, phone, email } = req.query;

    if (!programId) {
      return res.status(400).json({ message: "Program is required" });
    }

    const duplicateErrors = await checkDuplicateApplicantFields({
      programId,
      phone,
      email
    });

    res.status(200).json({
      isAvailable: Object.keys(duplicateErrors).length === 0,
      errors: duplicateErrors
    });
  } catch (error) {
    next(error);
  }
};

export const createApplicant = async (req, res, next) => {
  try {
    const payload = normalizeApplicantPayload(req.body);
    validateApplicantPayload(payload);

    const program = await Program.findById(payload.programId);
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    const duplicateErrors = await checkDuplicateApplicantFields({
      programId: payload.programId,
      phone: payload.phone,
      email: payload.email
    });

    if (Object.keys(duplicateErrors).length > 0) {
      return res.status(400).json({
        message: Object.values(duplicateErrors)[0],
        errors: duplicateErrors
      });
    }

    const quotaType = payload.quotaType;
    const currentApplicationCount = await Applicant.countDocuments({
      programId: payload.programId,
      quotaType
    });

    if (currentApplicationCount >= program.quotas[quotaType]) {
      throw new Error("No application available right now");
    }

    const application = await Applicant.create({
      ...payload,
      email: payload.email || undefined,
      marks: Number(payload.marks),
      documentsStatus: "Pending",
      feeStatus: "Pending",
      admissionStatus: "PENDING"
    });

    const populatedApplication = await Applicant.findById(application._id).populate(
      "programId",
      "name"
    );

    res.status(201).json(populatedApplication);
  } catch (error) {
    next(error);
  }
};

export const getApplicants = async (req, res, next) => {
  try {
    const filter = {};
    const { page, limit, skip } = buildPagination(req.query);

    if (["KCET", "COMEDK", "MANAGEMENT"].includes(req.query.quotaType)) {
      filter.quotaType = req.query.quotaType;
    }

    if (["PENDING", "ALLOCATED", "CONFIRMED"].includes(req.query.admissionStatus)) {
      filter.admissionStatus = req.query.admissionStatus;
    }

    const [applications, totalItems] = await Promise.all([
      Applicant.find(filter)
        .populate("programId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Applicant.countDocuments(filter)
    ]);

    res.status(200).json({
      items: applications,
      pagination: buildPaginationResponse({ totalItems, page, limit })
    });
  } catch (error) {
    next(error);
  }
};

export const updateDocumentsStatus = async (req, res, next) => {
  try {
    const { documentsStatus } = req.body;

    if (!["Pending", "Submitted", "Verified"].includes(documentsStatus)) {
      return res.status(400).json({ message: "Invalid documents status" });
    }

    const application = await Applicant.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.admissionStatus === "CONFIRMED") {
      return res.status(400).json({ message: confirmedMutationMessage });
    }

    application.documentsStatus = documentsStatus;
    await application.save();
    await application.populate("programId", "name");

    res.status(200).json(application);
  } catch (error) {
    next(error);
  }
};

export const updateFeeStatus = async (req, res, next) => {
  try {
    const { feeStatus } = req.body;

    if (!["Pending", "Paid"].includes(feeStatus)) {
      return res.status(400).json({ message: "Invalid fee status" });
    }

    const application = await Applicant.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.admissionStatus === "CONFIRMED") {
      return res.status(400).json({ message: confirmedMutationMessage });
    }

    application.feeStatus = feeStatus;
    await application.save();
    await application.populate("programId", "name");

    res.status(200).json(application);
  } catch (error) {
    next(error);
  }
};

