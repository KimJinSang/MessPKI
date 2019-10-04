class PKIContract {
  constructor(web3Data) {
    this.web3 = web3Data.web3;
    this.account = web3Data.accounts[0] || [];
    this.contract = web3Data.contract;
  }

  get currentAcc() {
    return this.account;
  }

  onAccChange(callback) {
    this.web3.currentProvider.publicConfigStore.on('update', (v) => {
      if (this.currentAcc.toUpperCase() !== v.selectedAddress.toUpperCase()) {
        if (callback) callback(v);
      }
    });
  }

  async isAdmin() {
    const owner = await this.contract.methods.owner().call();
    return owner === this.currentAcc;
  }

  /**
   * 
   * @param {Object} data : 유저 데이터 객체 스트링
   * @param {String} hash : 암호화된 데이터 해시
   */
  async append(data, hash) {
    const res = await this.contract.methods.append(data, hash).call({ from: this.currentAcc });
    await this.contract.methods.append(data, hash).send({ from: this.currentAcc });
    return res;
  }

  /**
   * 
   * @param {String} certId : append() 메서드를 통해 리턴된 certId 값
   * @param {*} sign : sign 해시
   * @param {*} expiry : 서명 유지 시간 (초단위)
   */
  async sign(certId, sign, expiry = 3000) {
    const res = await this.contract.methods.sign(certId, sign, expiry).call({ from: this.currentAcc });
    await this.contract.methods.sign(certId, sign, expiry).send({ from: this.currentAcc });
    return res;
  }

  async getCertInfo(certId) {
    const res = await this.contract.methods.registry(certId).call();
    return res;
  }

  async revoke(certId) {
    await this.contract.methods.revoke(certId).send({ from: this.currentAcc });
  }

  async getSignInfo(signId) {
    const res = await this.contract.methods.signings(signId).call();
    return res;
  }

  async isSignatureValid(signId) {
    const res = await this.contract.methods.isSignatureValid(signId).call();
    return res;
  }
}

export default PKIContract;