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
  getAll: () => api.get('/api/categories/all'),
  getDefaults: () => api.get('/api/categories/defaults'),
  getByUser: () => api.get('/api/categories/user'),
  create: (data) => api.post('/api/categories', data),
  update: (id, data) => api.put(`/api/categories/${id}`, data),
  deactivate: (id) => api.patch(`/api/categories/${id}/deactivate`),
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
  getActive: () => api.get('/api/budgets/active'),
  getByPeriod: (period) => api.get(`/api/budgets/period/${period}`),
};

export const notificationService = {
  getAll: () => api.get('/api/notifications/user'),
  getUnread: () => api.get('/api/notifications/unread'),
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
  markRead: (id) => api.put(`/api/notifications/${id}/mark-read`),
  markAllRead: () => api.put('/api/notifications/mark-all-read'),
  delete: (id) => api.delete(`/api/notifications/${id}`),
};

export const reportService = {
  getMonthlySummary: (month, year) => api.get(`/api/reports/monthly?month=${month}&year=${year}`),
  getCategoryBreakdown: (start, end) => api.get(`/api/reports/category-breakdown?start=${start}&end=${end}`),
  getIncomeVsExpense: (month, year) => api.get(`/api/reports/income-vs-expense?month=${month}&year=${year}`),
  getTrendAnalysis: (months = 6) => api.get(`/api/reports/trend?months=${months}`),
  getTopCategories: (topN = 5) => api.get(`/api/reports/top-categories?topN=${topN}`),
  getDailySpending: (month, year) => api.get(`/api/reports/daily-spending?month=${month}&year=${year}`),
  getSavingsRate: (month, year) => api.get(`/api/reports/savings-rate?month=${month}&year=${year}`),
  getYearlySummary: (year) => api.get(`/api/reports/yearly?year=${year}`),
  generatePdf: (data) => api.post('/api/reports/generate-pdf', data),
  getMyReports: () => api.get('/api/reports/my-reports'),
  deleteReport: (id) => api.delete(`/api/reports/${id}`),
};

export const adminService = {
  getAllUsers: () => api.get('/api/admin/users'),
  suspendAccount: (userId) => api.put(`/api/admin/users/${userId}/suspend`),
  deleteAccount: (userId) => api.delete(`/api/admin/users/${userId}`),
  getAnalytics: () => api.get('/api/admin/analytics'),
  getAuditLogs: (page = 1, pageSize = 50) => api.get(`/api/admin/audit-logs?page=${page}&pageSize=${pageSize}`),
  broadcastNotification: (data) => api.post('/api/admin/notifications/broadcast', data),
};
