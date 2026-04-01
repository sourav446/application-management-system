import axiosInstance from "./axiosInstance";

export const getAdmissions = async ({
  quotaType = "all",
  programId = "all",
  admissionStatus = "all",
  programType = "all",
  page = 1,
  limit = 10,
} = {}) => {
  const response = await axiosInstance.get("/admissions", {
    params: {
      ...(quotaType && quotaType !== "all" ? { quotaType } : {}),
      ...(programId && programId !== "all" ? { programId } : {}),
      ...(admissionStatus && admissionStatus !== "all"
        ? { admissionStatus }
        : {}),
      ...(programType && programType !== "all" ? { programType } : {}),
      page,
      limit,
    },
  });
  return response.data;
};

export const allocateSeat = async (applicantId) => {
  const response = await axiosInstance.post(`/admissions/allocate/${applicantId}`);
  return response.data;
};

export const confirmAdmission = async (applicantId) => {
  const response = await axiosInstance.post(`/admissions/confirm/${applicantId}`);
  return response.data;
};
