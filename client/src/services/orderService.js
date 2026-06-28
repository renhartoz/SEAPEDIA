import api from './api'

export const orderService = {
  previewCheckout: (data) => api.post('/checkout/preview/', data),
  checkout: (data) => api.post('/checkout/', data),
  getMyOrders: () => api.get('/orders/'),
  getOrderById: (id) => api.get(`/orders/${id}/`),
  getBuyerReport: () => api.get('/buyer/reports/'),
  getSellerOrders: () => api.get('/seller/orders/'),
  getSellerOrderById: (id) => api.get(`/seller/orders/${id}/`),
  processOrder: (id) => api.post(`/seller/orders/${id}/process/`),
  getSellerReport: () => api.get('/seller/reports/'),
}
