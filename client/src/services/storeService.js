import api from './api'

export const storeService = {
  getMyStore: () => api.get('/stores/me/'),
  createStore: (data) => api.post('/stores/me/', data, {
    headers: { 'Content-Type': undefined }
  }),
  updateStore: (data) => api.patch('/stores/me/', data, {
    headers: { 'Content-Type': undefined }
  }),
  getStores: () => api.get('/stores/'),
  getStoreById: (id) => api.get(`/stores/${id}/`),
}
