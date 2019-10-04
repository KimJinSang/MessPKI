import { api } from '../config';

const Cert = {
  get: (certId) => api.get(`cert/info/${certId}`),
  getAll: () => api.get('cert/list'),
  isSigned: (certId) => api.get(`cert/issigned/${certId}`),
  sign: (data) => api.post('cert/sign', data),
  update: (data) => api.put('cert/update', data),
  append: (data) => api.post('cert/append', data),
  revoke: (data) => api.put('cert/revoke', data),
}

export default Cert;