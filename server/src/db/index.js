import mongoose from 'mongoose';
import { host, dbConfig } from '../config';

const db = mongoose.connection;
db.on('error', console.error);  // 연결이 실패 할 경우
db.once('open', () => console.log("Connected to mongod server")); // 연결이 성공 할 경우

// 데이터베이스 연결
mongoose.connect(host(dbConfig()));
