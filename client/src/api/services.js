import api from "./axios";

export const authApi = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateMe: (data) => api.patch("/auth/me", data),
};

export const transactionApi = {
  getAll: (params) => api.get("/transactions", { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post("/transactions", data),
  delete: (id) => api.delete(`/transactions/${id}`),
  getSummary: () => api.get("/transactions/summary"),
  getBalanceTrend: (days) => api.get("/transactions/balance-trend", { params: { days } }),
};

export const projectApi = {
  getAll: (params) => api.get("/projects", { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post("/projects", data),
  update: (id, data) => api.patch(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getTransactions: (id) => api.get(`/projects/${id}/transactions`),
  allocateFunds: (id, data) => api.post(`/projects/${id}/allocate`, data),
};

export const expenseApi = {
  getAll: (params) => api.get("/expenses", { params }),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post("/expenses", data),
  update: (id, data) => api.patch(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  getCategoryDetail: (params) => api.get("/expenses/category-detail", { params }),
};

export const categoryApi = {
  getAll: () => api.get("/categories"),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.patch(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};
