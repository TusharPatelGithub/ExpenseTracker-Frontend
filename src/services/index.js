import api from '../utils/api';

export const expenseService = {
  getAll: () => api.get('/api/expenses/user'),
  getById: (id) => api.get(`/api/expenses/${id}`),
  add: (data) => api.post('/api/expenses', data),
  update: (id, data) => api.put(`/api/expenses/${id}`, data),
  delete: (id) => api.delete(`/api/expenses/${id}`),
  getByCategory: (categoryId) => api.get(`/api/expenses/category/${categoryId}`),
  getByDateRange: (start, end) => api.get(`/api/expenses/date-range?start=${start}&end=${end}`),
  getByPaymentMode: (mode) => api.get(`/api/expenses/payment-mode/${mode}`),
  getRecurring: () => api.get('/api/expenses/recurring'),
  search: (keyword) => api.get(`/api/expenses/search?keyword=${keyword}`),
  getTotal: () => api.get('/api/expenses/total'),
};

export const incomeService = {
  getAll: () => api.get('/api/incomes/user'),
  getById: (id) => api.get(`/api/incomes/${id}`),
  add: (data) => api.post('/api/incomes', data),
  update: (id, data) => api.put(`/api/incomes/${id}`, data),
  delete: (id) => api.delete(`/api/incomes/${id}`),
  getBySource: (source) => api.get(`/api/incomes/source/${source}`),
  getByDateRange: (start, end) => api.get(`/api/incomes/date-range?start=${start}&end=${end}`),
  getRecurring: () => api.get('/api/incomes/recurring'),
  getTotal: () => api.get('/api/incomes/total'),
  getNetBalance: () => api.get('/api/incomes/net-balance'),
};

export const categoryService = {
  getAll: () => api.get('/api/categories/all-for-user'),
  getDefaults: () => api.get('/api/categories/defaults'),
  getByUser: () => api.get('/api/categories/user'),
  create: (data) => api.post('/api/categories', data),
  update: (id, data) => api.put(`/api/categories/${id}`, data),
  deactivate: (id) => api.put(`/api/categories/${id}/deactivate`),
  delete: (id) => api.delete(`/api/categories/${id}`),
  seedDefaults: () => api.post('/api/categories/seed'),
};

export const budgetService = {
  getAll: () => api.get('/api/budgets/user'),
  getById: (id) => api.get(`/api/budgets/${id}`),
  create: (data) => api.post('/api/budgets', data),
  update: (id, data) => api.put(`/api/budgets/${id}`, data),
  delete: (id) => api.delete(`/api/budgets/${id}`),
  getAlerts: () => api.get('/api/budgets/alerts'),
  getUtilization: () => api.get('/api/budgets/utilization'),
};
