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
    if (!this.state.pkiContract) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
      <section id="app">
        <Admin pkiContract={this.state.pkiContract} />
      </section>
    );
  }

  async loadWeb3() {
    const web3 = await loadWeb3();
    const pkiContract = new PKIContract(web3);
    this.setState({ pkiContract });
  }
}

export default App;
