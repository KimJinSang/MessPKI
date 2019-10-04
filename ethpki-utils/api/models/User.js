import { api } from '../config';

const User = {
  getAll: () => api.get('user/list'),
  get: (hash) => api.get(`user/info/${hash}`),
  register: (data) => api.post('user/register', data),
  update: (data) => api.put('user/update', data),
}

export default User;