/**
 * 서버 및 데이터베이스 설정
 * 데이터베이스 : mongodb
 */


import { isDev } from '../utils';

const config = {
  // 프로덕션 설정
  prod: {
    app: { port: 5000 },
    database: {
      username: 'admin',
      password: 'wlstkd7',
      databaseName: 'ethpki',
    },
  },
  // development 설정
  dev: {
    app: { port: 5000 },
    database: {
      username: 'admin',
      password: 'wlstkd7',
      databaseName: 'ethpki',
    },
  },
}

// 데이터베이스 호스트 url 정보 리턴, dbInfo : config 설정 Object
export const host = (dbInfo) => {
  const { username, password, databaseName } = dbInfo;
  const hostUrl = `mongodb+srv://${username}:${password}@ethpki-1sh9v.mongodb.net/${databaseName}?retryWrites=true&w=majority`;
  return hostUrl;
}

// 현재 노드 환경에 따른 app config 객체 리턴
export const appConfig = () => {
  return isDev() ? config.dev.app : config.prod.app;
}

// 현재 노드 환경에 따른 db config 객체 리턴
export const dbConfig = () => {
  return isDev() ? config.dev.database : config.prod.database;
}