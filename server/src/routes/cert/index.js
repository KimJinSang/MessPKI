import express from "express";
import { Cert, User } from '../../db/models';
import NodeRSA from 'node-rsa';

const cert = express.Router();

cert.post('/append', append);
cert.get('/info/:cert_id', getInfo);
cert.get('/list', getList);
cert.post('/sign', sign);
cert.put('/update', update);
cert.put('/revoke', revoke);
cert.get('/issigned/:cert_id', isSigned);

async function append(req, res) {
  try {
    const { cert_id, user_hash } = req.body;
    const cert = new Cert({ cert_id, user_hash });
    const data = await cert.save();

    res.status(200).send(data);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
}

async function getInfo(req, res) {
  try {
    const { cert_id } = req.params;
    const data = await Cert.findOne({ cert_id });
    res.status(200).send(data);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
}

async function getList(req, res) {
  try {
    const data = await Cert.find();
    res.status(200).send(data);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
}

async function sign(req, res) {
  try {
    const { user_hash, cert_hash } = req.body;

    const userInfo = await User.findOne({ hash: user_hash });
    const { privatekey } = userInfo;

    const key = new NodeRSA(privatekey);
    const signValue = key.sign(cert_hash, 'base64');

    await Cert.update(
      { user_hash },
      { is_signed: true },
      { omitUndefined: true },
    );

    const data = signValue;
    res.status(200).send(data);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
}

async function update(req, res) {
  try {
    const { cert_id, ...rest } = req.body;

    await Cert.update(
      { cert_id },
      { ...rest },
      { omitUndefined: true },
    );

    const data = await Cert.findOne({ cert_id });
    res.status(200).send(data);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
}

async function revoke(req, res) {
  try {
    const { cert_id } = req.body;

    await Cert.update(
      { cert_id },
      { is_signed: false },
      { omitUndefined: true },
    );

    const data = await Cert.findOne({ cert_id });
    res.status(200).send(data);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
}

async function isSigned(req, res) {
  try {
    const { cert_id } = req.params;
    const data = await Cert.findOne({ cert_id }).select('is_signed');
    res.status(200).send(data);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
}

export default cert;