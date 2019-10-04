import express from "express";
import { Msg, User } from '../../db/models';

const msg = express.Router();

msg.post('/send', send);
msg.get('/list/:to', getList);

async function send(req, res) {
  try {
    const { from, to, content } = req.body;
    const { name: sender_name } = await User.findOne({ hash: from });
    const msg = new Msg({ from, to, content, sender_name });
    const data = await msg.save();
    res.status(200).send(data);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
}

async function getList(req, res) {
  const { to } = req.params;

  try {
    const data = await Msg.aggregate([
      {
        $lookup: {
          from: 'cert',
          localField: 'from',
          foreignField: 'user_hash',
          as: 'cert',
        },
      },
      {
        $match: { to },
      },
    ]);
    res.status(200).send(data);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
}

export default msg;