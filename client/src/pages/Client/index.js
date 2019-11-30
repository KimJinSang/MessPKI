import React, { Component } from 'react';
import NodeRSA from 'node-rsa';

import UserForm from '../../components/UserForm';
import MailBox from '../../components/MailBox';

import "./Client.scss";
import { User, Msg, Cert } from 'ethpki-utils/api/models';

class Client extends Component {
  constructor(props) {
    super(props);

    this.state = {
      content: '',
      userInfo: {},
      users: [],
      messages: [],
      certs: [],
      isLaoding: false,
      receiver: undefined,
    }

    this.handleSubmitUserForm = this.handleSubmitUserForm.bind(this);
    this.showCertificateInfo = this.showCertificateInfo.bind(this);
  }

  // 컴포넌트가 로드 되었을때 실행(라이프 싸이클 함수)
  async componentDidMount() {
    const { pkiContract } = this.props;
    this.setState({ isLaoding: true });

    // 계정 바꼇을때 새로고침
    pkiContract.onAccChange(() => window.location.reload());

    // 현재 유저 정보, 모든 유지 리스트, 인증서 리스트 변수 선언
    const { data: userInfo } = await User.get(pkiContract.currentAcc);
    const { data: users } = await User.getAll();
    const { data: certs } = await Cert.getAll();

    // 인증서 폐기 목록
    const crl = await this.validateSignatures(certs, users);

    // 메시지 리스트 받아옴(인증된 메시지, 인증되지 않은 메시지)
    const [signedMsgs, unsignedMsgs] = await this.loadMessageData(userInfo.hash, crl);

    this.setState({
      userInfo,
      users,
      signedMsgs,
      unsignedMsgs,
      certs,
      isLaoding: false,
    });
  }

  render() {
    const { userInfo, isLaoding } = this.state;

    // 로딩 중일때 로딩 화면 띄우기
    if (isLaoding) return <div>Loading UserInfo ...</div>

    return (
      <section id="client">
        {
          // 유저 정보가 있을 경우에는 renderContent를 하고 아닐 경우는 회원 가입 form 실행
          (userInfo.name && userInfo.email) ?
            this.renderContent()
            :
            < UserForm onSubmit={this.handleSubmitUserForm} />
        }
      </section>
    );
  }

  // 메시지 전송, 메시지 리스트 화면
  renderContent() {
    return (
      <div className='container'>
        <div className='sender-container main-container'>
          <label>SEND TO:
            <select
              onChange={e => this.setState({ receiver: e.target.value })}
              value={this.state.receiver}>
              <option value=''>--- Select Receiver ---</option>
              {
                // 수신자 선택
                this.state.users
                  .filter((v) => v.hash !== this.state.userInfo.hash)
                  .map((v, i) =>
                    <option
                      key={`user_${i}`}
                      value={v.hash}>{v.name}</option>
                  )
              }
            </select>
          </label>
          <textarea
            className='sender-textarea'
            onChange={e => this.setState({ content: e.target.value })}
            value={this.state.content} />
        </div>
        <div className='button-container'>
          <button className='btn' onClick={() => this.send()}>SEND</button>
        </div>
        <div className='receiver-container main-container'>
          <MailBox
            title='Signed Messages'
            msgs={this.state.signedMsgs}
            onClickName={this.showCertificateInfo} />
          <MailBox
            title='Unsigned Messages'
            msgs={this.state.unsignedMsgs}
            onClickName={this.showCertificateInfo} />
        </div>
      </div>
    );
  }

  // async : 비동기를 동기(순서대로)처럼 처리하도록
  // await : 동기 처럼 작동하도록 이전 코드가 완료될떄까지 기다리게 하는 코드
  // 메시지함에서 유저 이름 클릭 했을 때 인증서 정보 보여주는 함수
  async showCertificateInfo(msg) {
    const { pkiContract } = this.props;
    const { cert } = msg;

    // 인증서가 존재 하지 않을 경우
    if (!cert[0]) {
      alert(`Certificate not found`);
      return;
    }

    const { cert_id, sign_id } = cert[0];

    // 인증서 정보, 서명 여부 변수
    const certInfo = await pkiContract.getCertInfo(cert_id);
    const isSignValid = await pkiContract.isSignatureValid(sign_id);
    const { data, hash } = certInfo;

    console.log('isSignValid', isSignValid);

    // 인증서는 존재 하는데 서명이 없을 경우
    if ((sign_id !== 0 && !sign_id) || !isSignValid) {
      alert(`
[data]: ${data},
[hash]: ${hash},
[sign]: <Unsigned Certificate>
      `);
      return;
    }

    const signInfo = await pkiContract.getSignInfo(sign_id);
    const { expiry, owner, sign } = signInfo;

    // 그 외의 경우(인증서도 존재하고 서명도 된 경우)
    alert(`
[data]: ${data},
[hash]: ${hash},
[expiry]: ${expiry},
[owner]: ${owner},
[sign]: ${sign}
    `);
  }

  // 메시지 리스트 로드 함수
  async loadMessageData(userHash, crl) {
    const { data: messages } = await Msg.getAll(userHash);
    return this.groupMessages(messages, crl);
  }

  // 메시지 리스트를 인증된 메시지와 인증되지 않은 메시지 분류
  groupMessages(messages, crl) {
    const signed = [];
    const unsigned = [];

    // 각 메시지 인증 여부를 식별 해서 인증되었을 경우 signed 배열에 넣고 아닐 경우 unsigned 배열에 넣는다.
    messages.forEach((v) => {
      const certInfo = v.cert[0];
      if (certInfo && crl && !crl[certInfo.cert_id]) signed.push(v);
      else unsigned.push(v);
    });
    //console.log("인증된 메시지 : ", signed);
    //console.log("인증되지 않은 메시지 : ", unsigned);
    // 배열 리턴
    return [signed, unsigned];
  }

  // 인증서 폐기 목록 리턴(서명 여부 식별)
  async validateSignatures(certs, users) {
    const { pkiContract } = this.props;
    const crl = {};

    // certs 배열을 돌면서...(v 는 각각의 배열, 순서대로(0, 1, 2...))
    for (const v of certs) {  // 현재 로그인 한 유저 정보 말고는 다른 유저의 정보를 얻을 수 없기 때문에
      const { hash } = await pkiContract.getCertInfo(v.cert_id);
      const { sign } = await pkiContract.getSignInfo(v.sign_id);
      const isCertValid = await pkiContract.isSignatureValid(v.sign_id);

      // 현재 인증서를 소유한 유저 정보 획득(인증서를 가지고 있는 유저 전부의 정보를 각각 획득)
      const userInfo = users.find(user => user.hash === v.user_hash);
      // 해당 유저의 publickey를 받아와 NodeRSA 객체 생성
      const { publickey } = userInfo;
      const key = new NodeRSA(publickey);

      // 서명값 복호화 해서 인증서 hash 값과 일치하는지 비교
      const isValid = key.verify(hash, sign, 'utf8', 'base64');
      // 인증서 폐기 목록 생성
      crl[v.cert_id] = !(isValid && v.is_signed && isCertValid);
      console.log(userInfo.name ," : \nhash : ", hash,"\npublickey : ", publickey ,"\nsign : ", sign, "\nisValid : ", isValid, "\nisCertValid : ", isCertValid);
    }

    return crl;
  }

  // 메시지 전송
  async send() {
    const { content, userInfo, receiver: to } = this.state;
    const from = userInfo.hash;

    try {
      await Msg.send({ from, to, content });
      alert('성공적으로 발송되었습니다.');
      this.setState({ content: '' });
    } catch (e) {
      alert('메세지 전송 실패');
      console.error(e);
    }
  }

  // 회원 가입
  async handleSubmitUserForm(e) {
    // 기존 이벤트 발생하지 않도록 해줌
    e.preventDefault();

    const { pkiContract } = this.props;

    // 보낼 데이터 생성
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const hash = pkiContract.currentAcc;

    try {
      // 유저 등록
      await User.register({ name, email, hash });
      this.setState({ userInfo: { name, email } });
    } catch (e) {
      alert('회원가입\에 실패하였습니다.');
      console.error(e);
    }

  }
}

export default Client;