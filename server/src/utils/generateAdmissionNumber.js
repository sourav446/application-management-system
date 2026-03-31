import Applicant from "../models/Applicant.js";

const PROGRAM_CODE_MAP = {
  "Computer Science and Engineering": "CSE",
  "Information Science and Engineering": "ISE",
  "Electronics and Communication Engineering": "ECE"
};

const resolveProgramCode = (programName) => {
  if (PROGRAM_CODE_MAP[programName]) {
    return PROGRAM_CODE_MAP[programName];
  }

  return programName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 4);
};

const generateAdmissionNumber = async ({ year, level, programName, quota }) => {
  const totalAdmissions = await Applicant.countDocuments({
    admissionNumber: { $exists: true, $ne: null }
  });
  const sequence = String(totalAdmissions + 1).padStart(4, "0");
  const programCode = resolveProgramCode(programName);

  return `INST/${year}/${level}/${programCode}/${quota}/${sequence}`;
};

export default generateAdmissionNumber;
