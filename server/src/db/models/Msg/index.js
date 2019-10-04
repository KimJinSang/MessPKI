import mongoose, { Schema } from 'mongoose';

const Msg = new Schema({
  from: {
    type: String,
  },
  to: {
    type: String,
  },
  sender_name: {
    type: String,
  },
  content: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('msg', Msg, 'msg');
