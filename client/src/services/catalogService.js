import api from './api'

export const catalogService = {
  getProducts: (params = {}) => api.get('/products/', { params }),
  getProductById: (id) => api.get(`/products/${id}/`),
  getMyProducts: () => api.get('/products/seller/'),
  createProduct: (data) => api.post('/products/seller/', data, {
    headers: { 'Content-Type': undefined }
  }),
  updateProduct: (id, data) => api.patch(`/products/seller/${id}/`, data, {
    headers: { 'Content-Type': undefined }
  }),
  deleteProduct: (id) => api.delete(`/products/seller/${id}/`),
}
