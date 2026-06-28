import api from './api'

export const addressService = {
  getAddresses: () => api.get('/auth/addresses/'),
  createAddress: (data) => api.post('/auth/addresses/', data),
  updateAddress: (id, data) => api.patch(`/auth/addresses/${id}/`, data),
  deleteAddress: (id) => api.delete(`/auth/addresses/${id}/`),
}
