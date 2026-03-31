import axiosInstance from "./axiosInstance";

export const getPrograms = async ({ status = "all", page = 1, limit = 10 } = {}) => {
  const response = await axiosInstance.get("/programs", {
    params: {
      ...(status && status !== "all" ? { status } : {}),
      page,
      limit
    }
  });
  return response.data;
};

export const createProgram = async (payload) => {
  const response = await axiosInstance.post("/programs", payload);
  return response.data;
};

export const updateProgram = async ({ id, payload }) => {
  const response = await axiosInstance.put(`/programs/${id}`, payload);
  return response.data;
};

export const deleteProgram = async ({ id, nameConfirmation }) => {
  const response = await axiosInstance.delete(`/programs/${id}`, {
    data: { nameConfirmation }
  });
  return response.data;
};
