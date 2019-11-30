class PKIContract {
  constructor(web3Data) {
    this.web3 = web3Data.web3;
    this.account = web3Data.accounts[0] || [];
    this.contract = web3Data.contract;
  }

  // 현재 계정 해시 얻는 함수
  get currentAcc() {
    return this.account;
  }

  // 메타 마스크 계정 변경 이벤트 리스너
  onAccChange(callback) {
    this.web3.currentProvider.publicConfigStore.on('update', (v) => {
      if (this.currentAcc.toUpperCase() !== v.selectedAddress.toUpperCase()) {
        if (callback) callback(v);
      }
    });
  }

  // 첫번째 계정이 맞는지 식별
  async isAdmin() {
    const owner = await this.contract.methods.owner().call();
    return owner === this.currentAcc;
  }

  /**
   * 인증서 추가
   * @param {Object} data : 유저 데이터 객체 스트링
   * @param {String} hash : 암호화된 데이터 해시
   */
  async append(data, hash) {
    const res = await this.contract.methods.append(data, hash).call({ from: this.currentAcc });
    await this.contract.methods.append(data, hash).send({ from: this.currentAcc });
    return res;
  }

  /**
   * 인증서 서명
   * @param {String} certId : append() 메서드를 통해 리턴된 certId 값
   * @param {*} sign : sign 해시
   * @param {*} expiry : 서명 유지 시간 (초단위)
   */
  async sign(certId, sign, expiry = 86400) {
    const res = await this.contract.methods.sign(certId, sign, expiry).call({ from: this.currentAcc });
    await this.contract.methods.sign(certId, sign, expiry).send({ from: this.currentAcc });
    return res;
  }

  // 인증서 정보 얻는 함수
  async getCertInfo(certId) {
    const res = await this.contract.methods.registry(certId).call();
    return res;
  }

  // 인증서 폐기 함수
  async revoke(certId) {
    await this.contract.methods.revoke(certId).send({ from: this.currentAcc });
  }

  // 인증서 서명 정보 얻는 함수
  async getSignInfo(signId) {
    const res = await this.contract.methods.signings(signId).call();
    return res;
  }

  // 서명 여부 식별 함수
  async isSignatureValid(signId) {
    const res = await this.contract.methods.isSignatureValid(signId).call();
    return res;
  }
}

export default PKIContract;