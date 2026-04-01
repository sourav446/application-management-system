import axiosInstance from "./axiosInstance";

export const createApplicant = async (payload) => {
  const response = await axiosInstance.post("/applicants", payload);
  return response.data;
};

export const checkApplicantAvailability = async ({ programId, phone, email }) => {
  const response = await axiosInstance.get("/applicants/check-availability", {
    params: {
      programId,
      phone,
      email
    }
  });
  return response.data;
};

export const getApplicants = async ({
  quotaType = "all",
  admissionStatus = "all",
  degreeType = "all",
  page = 1,
  limit = 10
} = {}) => {
  const params = {};

  if (quotaType !== "all") {
    params.quotaType = quotaType;
  }

  if (admissionStatus !== "all") {
    params.admissionStatus = admissionStatus;
  }

  if (degreeType !== "all") {
    params.degreeType = degreeType;
  }

  params.page = page;
  params.limit = limit;

  const response = await axiosInstance.get("/applicants", { params });
  return response.data;
};

export const updateDocumentsStatus = async ({ id, documentsStatus }) => {
  const response = await axiosInstance.put(`/applicants/${id}/documents`, {
    documentsStatus
  });
  return response.data;
};

export const updateFeeStatus = async ({ id, feeStatus }) => {
  const response = await axiosInstance.put(`/applicants/${id}/fee`, {
    feeStatus
  });
  return response.data;
};
