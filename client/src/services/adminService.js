import api from './api'

export const adminService = {
  getStats: () => api.get('/admin/stats/'),
  getUsers: () => api.get('/admin/users/'),
  getStores: () => api.get('/admin/stores/'),
  getProducts: () => api.get('/admin/products/'),
  getOrders: () => api.get('/admin/orders/'),
  getJobs: () => api.get('/admin/jobs/'),
  getOverdueOrders: () => api.get('/admin/overdue/'),
  simulateNextDay: () => api.post('/admin/simulate-next-day/'),
  getVouchers: () => api.get('/admin/vouchers/'),
  createVoucher: (data) => api.post('/admin/vouchers/', data),
  getPromos: () => api.get('/admin/promos/'),
  createPromo: (data) => api.post('/admin/promos/', data),
}
