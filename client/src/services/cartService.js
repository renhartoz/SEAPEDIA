import api from './api'

export const cartService = {
  getCart: () => api.get('/cart/'),
  addItem: (product_id, quantity) => api.post('/cart/items/', { product_id, quantity }),
  updateItem: (itemId, quantity) => api.patch(`/cart/items/${itemId}/`, { quantity }),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}/`),
  clearCart: () => api.delete('/cart/'),
}
