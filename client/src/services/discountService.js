import api from './api'

export const discountService = {
  validate: (code, subtotal) => api.post('/discounts/validate/', { code, subtotal }),
  getVouchers: () => api.get('/discounts/vouchers/'),
  getPromos: () => api.get('/discounts/promos/'),
}
