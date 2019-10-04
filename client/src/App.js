import React, { Component } from "react";
import loadWeb3 from "ethpki-utils/loadWeb3";
import PKIContract from 'ethpki-utils/PKIContract';

import Client from './pages/Client';

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
    if (!this.state.pkiContract) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
      <div id='app'>
        <Client pkiContract={this.state.pkiContract} />
      </div>
    );
  }

  async loadWeb3() {
    const web3 = await loadWeb3();
    const pkiContract = new PKIContract(web3);
    this.setState({ pkiContract });
  }
}

export default App;
