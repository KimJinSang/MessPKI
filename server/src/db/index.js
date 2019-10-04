import mongoose from 'mongoose';
import { host, dbConfig } from '../config';

const db = mongoose.connection;
db.on('error', console.error);
db.once('open', () => console.log("Connected to mongod server"));

// Connect To Server
mongoose.connect(host(dbConfig()));
