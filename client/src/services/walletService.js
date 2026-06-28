import api from './api'

export const walletService = {
  getWallet: () => api.get('/wallet/'),
  topUp: (amount) => api.post('/wallet/topup/', { amount }),
}
