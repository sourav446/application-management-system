import axiosInstance from "./axiosInstance";

export const getAdmissions = async () => {
  const response = await axiosInstance.get("/admissions");
  return response.data;
};
