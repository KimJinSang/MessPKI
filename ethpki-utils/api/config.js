import axios from 'axios';

// 서버와 연결(node 서버와 연결)
export const api = axios.create({
  baseURL: 'http://localhost:5000/',
  timeout: 10000,
});