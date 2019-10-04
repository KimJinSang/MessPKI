import mongoose, { Schema } from 'mongoose';

const User = new Schema({
  hash: {
    type: String,
    unique: true,
  },
  name: String,
  email: String,
  publickey: String,
  privatekey: String,
  reg_date: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.model('user', User, 'user');
