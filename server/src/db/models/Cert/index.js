import mongoose, { Schema } from 'mongoose';

const Cert = new Schema({
  cert_id: {
    type: Number,
    unique: true,
  },
  sign_id: {
    type: Number,
    unique: true,
  },
  user_hash: {
    type: String,
    unique: true,
  },
  reg_date: {
    type: Date,
    default: Date.now,
  },
  is_signed: {
    type: Boolean,
    default: false,
  }
});

export default mongoose.model('cert', Cert, 'cert');
