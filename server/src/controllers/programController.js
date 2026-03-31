import Applicant from "../models/Applicant.js";
import Program from "../models/Program.js";
import { buildPagination, buildPaginationResponse } from "../utils/pagination.js";

const quotaKeys = ["KCET", "COMEDK", "MANAGEMENT"];

const buildQuotaObject = (source = {}) => ({
  KCET: Number(source.KCET ?? 0),
  COMEDK: Number(source.COMEDK ?? 0),
  MANAGEMENT: Number(source.MANAGEMENT ?? 0)
});

const getQuotaTotal = (quotas) => quotaKeys.reduce((total, key) => total + Number(quotas[key] || 0), 0);

const getProgramPayload = (payload, existingProgram = null) => {
  const existingQuotas = existingProgram
    ? existingProgram.quotas.toObject()
    : { KCET: 0, COMEDK: 0, MANAGEMENT: 0 };

  return {
    name: (payload.name ?? existingProgram?.name ?? "").trim(),
    intake: Number(payload.intake ?? existingProgram?.intake ?? 0),
    status: payload.status ?? existingProgram?.status ?? "active",
    quotas: buildQuotaObject({
      ...existingQuotas,
      ...(payload.quotas || {})
    })
  };
};

const validateProgramPayload = ({ name, intake, status, quotas }) => {
  if (!name) {
    return "Program name is required";
  }

  if (Number.isNaN(intake) || intake < 1) {
    return "Intake must be greater than 0";
  }

  if (!["active", "inactive"].includes(status)) {
    return "Invalid program status";
  }

  for (const quotaKey of quotaKeys) {
    if (Number.isNaN(quotas[quotaKey]) || quotas[quotaKey] < 0) {
      return `${quotaKey} quota cannot be negative`;
    }
  }

  if (getQuotaTotal(quotas) > intake) {
    return "Total quota seats cannot be greater than intake";
  }

  return "";
};

const getApplicationCounts = async (programId) => {
  const groupedCounts = await Applicant.aggregate([
    {
      $match: {
        programId
      }
    },
    {
      $group: {
        _id: "$quotaType",
        count: { $sum: 1 }
      }
    }
  ]);

  const counts = {
    KCET: 0,
    COMEDK: 0,
    MANAGEMENT: 0,
    total: 0
  };

  groupedCounts.forEach((item) => {
    counts[item._id] = item.count;
    counts.total += item.count;
  });

  return counts;
};

const validateProgramCapacityRules = ({ program, nextState, applicationCounts }) => {
  const allocatedSeats = buildQuotaObject(program.filledSeats || {});
  const totalAllocatedSeats = getQuotaTotal(allocatedSeats);

  if (nextState.intake < applicationCounts.total) {
    return "Cannot reduce intake below received applications";
  }

  if (nextState.intake < totalAllocatedSeats) {
    return "Cannot reduce intake below allocated seats";
  }

  for (const quotaKey of quotaKeys) {
    if (nextState.quotas[quotaKey] < applicationCounts[quotaKey]) {
      return `Cannot reduce ${quotaKey} quota below received applications`;
    }

    if (nextState.quotas[quotaKey] < allocatedSeats[quotaKey]) {
      return `Cannot reduce ${quotaKey} quota below allocated seats`;
    }
  }

  return "";
};

export const createProgram = async (req, res, next) => {
  try {
    const payload = getProgramPayload(req.body);
    const validationMessage = validateProgramPayload(payload);

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const program = await Program.create({
      name: payload.name,
      intake: payload.intake,
      status: payload.status,
      quotas: payload.quotas
    });

    res.status(201).json(program);
  } catch (error) {
    next(error);
  }
};

export const getPrograms = async (req, res, next) => {
  try {
    const filter = {};
    const fetchAll = req.query.limit === "all";
    const { page, limit, skip } = fetchAll
      ? { page: 1, limit: 10, skip: 0 }
      : buildPagination(req.query);

    if (["active", "inactive"].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const programQuery = Program.find(filter).sort({ createdAt: -1 }).lean();

    if (!fetchAll) {
      programQuery.skip(skip).limit(limit);
    }

    const [programs, totalItems] = await Promise.all([
      programQuery,
      Program.countDocuments(filter)
    ]);

    const programIds = programs.map((program) => program._id);
    const applicantCounts = programIds.length
      ? await Applicant.aggregate([
          {
            $match: {
              programId: { $in: programIds }
            }
          },
          {
            $group: {
              _id: {
                programId: "$programId",
                quotaType: "$quotaType"
              },
              count: { $sum: 1 }
            }
          }
        ])
      : [];

    const countMap = new Map();
    applicantCounts.forEach((item) => {
      const programId = String(item._id.programId);
      const existing = countMap.get(programId) || {
        KCET: 0,
        COMEDK: 0,
        MANAGEMENT: 0,
        total: 0
      };

      existing[item._id.quotaType] = item.count;
      existing.total += item.count;
      countMap.set(programId, existing);
    });

    const programsWithStats = programs.map((program) => ({
      ...program,
      applicationCounts: countMap.get(String(program._id)) || {
        KCET: 0,
        COMEDK: 0,
        MANAGEMENT: 0,
        total: 0
      }
    }));

    res.status(200).json({
      items: programsWithStats,
      pagination: buildPaginationResponse({
        totalItems,
        page: fetchAll ? 1 : page,
        limit: fetchAll ? Math.max(totalItems, 1) : limit
      })
    });
  } catch (error) {
    next(error);
  }
};

export const updateProgram = async (req, res, next) => {
  try {
    const existingProgram = await Program.findById(req.params.id);

    if (!existingProgram) {
      return res.status(404).json({ message: "Program not found" });
    }

    const nextState = getProgramPayload(req.body, existingProgram);
    const validationMessage = validateProgramPayload(nextState);

    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const applicationCounts = await getApplicationCounts(existingProgram._id);

    if (nextState.status === "inactive" && applicationCounts.total > 0) {
      return res.status(400).json({
        message: "Applications already started. Cannot inactive the program"
      });
    }

    const capacityValidationMessage = validateProgramCapacityRules({
      program: existingProgram,
      nextState,
      applicationCounts
    });

    if (capacityValidationMessage) {
      return res.status(400).json({ message: capacityValidationMessage });
    }

    const program = await Program.findByIdAndUpdate(
      req.params.id,
      {
        name: nextState.name,
        intake: nextState.intake,
        status: nextState.status,
        quotas: nextState.quotas
      },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json(program);
  } catch (error) {
    next(error);
  }
};

export const deleteProgram = async (req, res, next) => {
  try {
    const program = await Program.findById(req.params.id);

    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    if (req.body?.nameConfirmation !== program.name) {
      return res.status(400).json({
        message: "Program name confirmation does not match"
      });
    }

    const applicationCount = await Applicant.countDocuments({ programId: program._id });
    if (applicationCount > 0) {
      return res.status(400).json({
        message: "Applications received cannot delete the program"
      });
    }

    await Program.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Program deleted successfully" });
  } catch (error) {
    next(error);
  }
};
