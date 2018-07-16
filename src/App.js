import React, { Component } from 'react';
import { Provider } from 'react-redux';
import Container from './container/Container';

import createAppStore from './redux/store';

class App extends Component {
  render() {
    return (
      <Provider store={createAppStore()}>
        <Container />
      </Provider>
    );
  }
}

export default App;