import React, { Component } from 'react';
import loadWeb3 from "ethpki-utils/loadWeb3";
import PKIContract from 'ethpki-utils/PKIContract';

import Admin from './pages/Admin';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pkiContract: undefined,
    }
  }

  async componentDidMount() {
    await this.loadWeb3();
  };

  render() {
    // pkiContract 객체가 존재하지 않을때는 로딩화면 보여주기
    if (!this.state.pkiContract) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
      <section id="app">
        {/* state에 저장된 pkiContract 객체를 하위 컴포넌트로 전달 */}
        <Admin pkiContract={this.state.pkiContract} />
      </section>
    );
  }

  // web3를 로드하고 PKIContract 객체 생성 후 state로 저장
  async loadWeb3() {
    const web3 = await loadWeb3();
    const pkiContract = new PKIContract(web3);
    this.setState({ pkiContract });
  }
}

export default App;
