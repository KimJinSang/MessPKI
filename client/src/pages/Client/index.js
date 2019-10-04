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

  async componentDidMount() {
    const { pkiContract } = this.props;
    this.setState({ isLaoding: true });

    pkiContract.onAccChange(() => window.location.reload());

    const { data: userInfo } = await User.get(pkiContract.currentAcc);
    const { data: users } = await User.getAll();
    const { data: certs } = await Cert.getAll();

    const crl = await this.validateSignatures(certs, users);

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

    if (isLaoding) return <div>Loading UserInfo ...</div>

    return (
      <section id="client">
        {
          (userInfo.name && userInfo.email) ?
            this.renderContent()
            :
            < UserForm onSubmit={this.handleSubmitUserForm} />
        }
      </section>
    );
  }

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

  async showCertificateInfo(msg) {
    const { pkiContract } = this.props;
    const { cert } = msg;

    if (!cert[0]) {
      alert(`Certificate not found`);
      return;
    }

    const { cert_id, sign_id } = cert[0];

    const certInfo = await pkiContract.getCertInfo(cert_id);
    const isSignValid = await pkiContract.isSignatureValid(sign_id);
    const { data, hash } = certInfo;

    console.log('isSignValid', isSignValid);

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

    alert(`
[data]: ${data},
[hash]: ${hash},
[expiry]: ${expiry},
[owner]: ${owner},
[sign]: ${sign}
    `);
  }

  async loadMessageData(userHash, crl) {
    const { data: messages } = await Msg.getAll(userHash);
    return this.groupMessages(messages, crl);
  }

  groupMessages(messages, crl) {
    const signed = [];
    const unsigned = [];

    messages.forEach((v) => {
      const certInfo = v.cert[0];
      if (certInfo && crl && !crl[certInfo.cert_id]) signed.push(v);
      else unsigned.push(v);
    });

    return [signed, unsigned];
  }

  async validateSignatures(certs, users) {
    const { pkiContract } = this.props;
    const crl = {};

    for (const v of certs) {
      const { hash } = await pkiContract.getCertInfo(v.cert_id);
      const { sign } = await pkiContract.getSignInfo(v.sign_id);
      const isCertValid = await pkiContract.isSignatureValid(v.sign_id);

      const userInfo = users.find(user => user.hash === v.user_hash);
      const { publickey } = userInfo;
      const key = new NodeRSA(publickey);

      const isValid = key.verify(hash, sign, 'utf8', 'base64');
      crl[v.cert_id] = !(isValid && v.is_signed && isCertValid);
    }

    return crl;
  }

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

  async handleSubmitUserForm(e) {
    e.preventDefault();

    const { pkiContract } = this.props;

    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const hash = pkiContract.currentAcc;

    try {
      await User.register({ name, email, hash });
      this.setState({ userInfo: { name, email } });
    } catch (e) {
      alert('회원가입\에 실패하였습니다.');
      console.error(e);
    }

  }
}

export default Client;