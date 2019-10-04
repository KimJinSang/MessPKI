import { api } from '../config';

const Msg = {
  getAll: (to) => api.get(`msg/list/${to}`),
  send: (data) => api.post('msg/send', data),
}

export default Msg;