import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import routes from './routes';
import { appConfig } from './config';
import './db';

const app = express();
const appConf = appConfig();

// 미들웨어 설정
app.use(cors()); // cross-origin(ip 허용 범위) 전체 허용
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '5mb' })); // json 사이즈 5mb 제한(트래픽 제한)

// routes 폴더안에 api들 설정(api 주소 사용등록)
app.use(routes);

// 서버 실행
// appConf.port = 5000
app.listen(appConf.port, () => {
  console.log(`Server is running at port ${appConf.port}`);
});
