import express from "express";
import { Cert, User } from '../../db/models';
import NodeRSA from 'node-rsa';

const cert = express.Router();

// 프론트(api)와 연결되는 엔드포인트
cert.post('/append', append);
cert.get('/info/:cert_id', getInfo);
cert.get('/list', getList);
cert.post('/sign', sign);
cert.put('/update', update);
cert.put('/revoke', revoke);
cert.get('/issigned/:cert_id', isSigned);

// 인증서 추가(생성)
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

// 인증서 정보
// 인증서를 아이디로 인증서 하나의 정보를 획득
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

// 인증서 리스트 반환
async function getList(req, res) {
  try {
    const data = await Cert.find();
    res.status(200).send(data);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
}

// 인증서 서명
// 유저의 개인키로 서명후 서명값 리턴
async function sign(req, res) {
  try {
    const { user_hash, cert_hash } = req.body;

    // 유저의 개인키 획득
    const userInfo = await User.findOne({ hash: user_hash });
    const { privatekey } = userInfo;

    // 개인키로 cert_hash 서명
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

// 인증서 정보 업데이트
async function update(req, res) {
  try {
    // cert_id와 나머지
    const { cert_id, ...rest } = req.body;

    // cert_id를 제외한 나머지 정보 업데이트
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

// 인증서 폐기
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

// 인증서 서명 여부 확인
async function isSigned(req, res) {
  try {
    const { cert_id } = req.params;
    // is_signed 값 리턴
    const data = await Cert.findOne({ cert_id }).select('is_signed');
    res.status(200).send(data);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
}

export default cert;