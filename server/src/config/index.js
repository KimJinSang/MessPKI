import { isDev } from '../utils';

const config = {
  prod: {
    app: { port: 5000 },
    database: {
      username: 'admin',
      password: 'wlstkd7',
      databaseName: 'ethpki',
    },
  },
  dev: {
    app: { port: 5000 },
    database: {
      username: 'admin',
      password: 'wlstkd7',
      databaseName: 'ethpki',
    },
  },
}

export const host = (dbInfo) => {
  const { username, password, databaseName } = dbInfo;
  const hostUrl = `mongodb+srv://${username}:${password}@ethpki-1sh9v.mongodb.net/${databaseName}?retryWrites=true&w=majority`;
  return hostUrl;
}

export const appConfig = () => {
  return isDev() ? config.dev.app : config.prod.app;
}

export const dbConfig = () => {
  return isDev() ? config.dev.database : config.prod.database;
}