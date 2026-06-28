import api from './api'

export const reviewService = {
  list: (params) => api.get('/reviews/', { params }),
  create: (data) => api.post('/reviews/create/', data),
}
