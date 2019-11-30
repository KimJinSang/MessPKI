import React, { Component } from 'react';
import { sha512 } from 'js-sha512';

import './Admin.scss';
import { User, Cert } from 'ethpki-utils/api/models';
import certForm from '../../certForm.json';

class Admin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      users: [],
      certs: [],
      loading: false,
      isAdmin: false,
    }

    this.handleCreateCert = this.handleCreateCert.bind(this);
  }

  async componentDidMount() {
    const { pkiContract } = this.props;

    // 메타마스크 유저 변경 시 새로고침
    pkiContract.onAccChange(() => window.location.reload());
    // 현재 선택된 유저가 admin인지 식별하고 유저, 인증서 데이터 로드
    this.setState({ loading: true });
    const isAdmin = await pkiContract.isAdmin();
    this.setState({ isAdmin, loading: false });
    await this.loadData();    
  }

  render() {
    if (this.state.loading) return <div>Loading...</div>
    // admin이 아닌경우
    if(!this.state.isAdmin) return <div>Only owner allowed</div>

    return (
      <section id='admin'>
        <ul className='user-list'>
          {this.state.users.map((v, i) => ( // 유저 리스트 뿌려주는곳
            <li key={i}>
              <span>{v.name}</span>
              {this.isSigned(v.hash) ?
                <button className='revoke-btn' onClick={() => this.revokeCert(v.hash)}>인증서 폐기</button>
                :
                <button onClick={() => this.handleCreateCert(v)}>인증서 발행</button>
              }
            </li>
          ))}
        </ul>
      </section>
    );
  }

  // 유저와 인증서 데이터 로드
  async loadData() {
    const { data: users } = await User.getAll();
    const { data: certs } = await Cert.getAll();
    this.setState({ users, certs });
  }

  // 인증서 해시로 인증서 정보 가져오기
  getCertInfo(userHash) {
    const { certs } = this.state;
    return certs.find((v) => v.user_hash === userHash);
  }

  // 서명 여부 식별
  isSigned(userHash) {
    const certInfo = this.getCertInfo(userHash);
    if (certInfo) return certInfo.is_signed;
    else return false;
  }

  // 인증서 발행 버튼 클릭 이벤트
  async handleCreateCert(userInfo) {
    const certId = await this.appendCert(userInfo);
    await this.signCert(certId, userInfo);
  }

  // 인증서 추가
  async appendCert(userInfo) {
    const { pkiContract } = this.props;

    try {
      const certInfo = this.getCertInfo(userInfo.hash);

      // 이미 존재하는 인증서 인 경우 인증서 id 리턴
      if (certInfo) return certInfo.cert_id;

      // 인증서 유저 정보 공개키 변수 선언
      let data = certForm;
      data.userInfo = userInfo;
      data.publickey = userInfo.publickey;

      // 인증서 데이터 json 형식을 string으로 변환 하고 hash 함수로 해시화
      data = JSON.stringify(data);
      const hash = sha512(data);
      console.log("인증서 데이터 값 : ", data);
      console.log("인증서 데이터 해시값 : ", hash);

      // 솔리디티에 있는 인증서 등록 함수 호출
      const certId = await pkiContract.append(data, hash);
      // 서버에 정보 send
      await Cert.append({
        cert_id: certId,
        user_hash: userInfo.hash,
      });
      // 새로 생성된 인증서의 id 리턴
      return certId;
    } catch (e) {
      alert('인증서 발행에 실패하였습니다.');
      console.error(e);
    }
  }

  // 인증서 서명
  async signCert(certId, userInfo) {
    const { pkiContract } = this.props;

    try {
      // 유저 정보와 인증서 해시 받아옴
      const { hash: certHash } = await pkiContract.getCertInfo(certId);
      const { hash: userHash } = userInfo;

      // 인증서 서명(서버)
      const { data: sign } = await Cert.sign({
        user_hash: userHash,
        cert_hash: certHash,
      });

      console.log("서명 값 : ", sign);

      // 인증서 서명(블록체인)
      const signId = await pkiContract.sign(certId, sign);
      // 인증서 업데이트(서버)
      await Cert.update({ cert_id: certId, sign_id: signId });

      // 유저와 인증서 정보 새로고침
      await this.loadData();
      console.log(`Certifcate(${certId}) has been signed on signId(${signId})`);
    } catch (e) {
      alert('인증서 서명에 실패하였습니다.');
      console.error(e);
    }
  }

  // 인증서 폐기
  async revokeCert(userHash) {
    const { pkiContract } = this.props;

    try {
      const certInfo = this.getCertInfo(userHash);
      const { cert_id, sign_id } = certInfo;

      // 인증서 폐기(블록체인)
      await pkiContract.revoke(sign_id);
      // 인증서 폐기(서버)
      await Cert.revoke({ cert_id });
      // 인증서 데이터 새로고침
      await this.loadData();
    } catch (e) {
      alert('인증서 폐기에 실패하였습니다.');
      console.error(e);
    }
  }
}

export default Admin;