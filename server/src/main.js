import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import routes from './routes';
import { appConfig } from './config';
import './db';

const app = express();
const appConf = appConfig();

// Request Middleware
app.use(cors()); // cross-origin 전체 허용
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '5mb' })); // json 사이즈 5mb 제한

// Set API Routes
app.use(routes);

// Run Server
app.listen(appConf.port, () => {
  console.log(`Server is running at port ${appConf.port}`);
});
