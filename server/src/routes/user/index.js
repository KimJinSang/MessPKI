import express from "express";
import { User } from '../../db/models';
import NodeRSA from 'node-rsa';

const user = express.Router();

user.post('/register', register);
user.put('/update', update);
user.get('/list', getList);
user.get('/info/:hash', getInfo);

/**
 * 유저 등록 
 */
async function register(req, res) {
  try {
    const { name, email, hash } = req.body;

    // 공개키/개인키 생성
    const key = new NodeRSA({ b: 512 });
    const publickey = key.exportKey('pkcs8-public');
    const privatekey = key.exportKey('pkcs8-private');

    // 유저 데이터 등록
    const user = new User({ name, email, hash, publickey, privatekey });
    const data = await user.save();
    
    res.status(200).send(data);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
}

// 유저 정보 업데이트
async function update(req, res) {
  try {
    const { hash } = req.body; // hash : 유저 계정 hash 정보

    // undefined 속성인 값들은 제외하고 유저 정보 업데이트
    await User.update({ hash }, req.body, {
      omitUndefined: true,
    });

    // 업데이트 후 privatekey를 제외한 유저정보를 select 해와서 요청자에게 전송
    const data = await User.findOne({ hash }).select('-privatekey');
    res.status(200).send(data);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
}

// 유저 리스트
async function getList(req, res) {
  try {
    const data = await User.find().select('-privatekey');
    res.status(200).send(data);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
}

// 유저 한명의 정보를 받아옴
async function getInfo(req, res) {
  try {
    const { hash } = req.params;

    const data = await User.findOne({ hash }).select('-privatekey');
    res.status(200).send(data);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
}

export default user;
