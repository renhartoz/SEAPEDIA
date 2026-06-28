import api from './api'

export const deliveryService = {
  getAvailableJobs: () => api.get('/driver/jobs/'),
  getJobById: (id) => api.get(`/driver/jobs/${id}/`),
  takeJob: (id) => api.post(`/driver/jobs/${id}/take/`),
  completeJob: (id) => api.post(`/driver/jobs/${id}/complete/`),
  getJobHistory: () => api.get('/driver/history/'),
  getEarnings: () => api.get('/driver/earnings/'),
}
