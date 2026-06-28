import api from './api'

export const authService = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
  refreshToken: (refresh) => api.post('/auth/token/refresh/', { refresh }),
  switchRole: (role) => api.post('/auth/role-switch/', { role }),
  me: () => api.get('/auth/me/'),
}
