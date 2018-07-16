import React, { Component } from 'react';
import { connect } from 'react-redux';
import { AutoSizer } from 'react-virtualized';

import { login } from  '../redux/modules/domain/user';
import { searchPlayers } from  '../redux/modules/domain/match';


const styles = {
  root: {
    display: 'flex',
  },
  leftPane: {
    width: 380,
    padding: 8,
  },
  rightPane: {
    flex: 1,
  },
  controls: {
    margin: 5,
    width: 283,
    lineHeight: '30px',
  },
  divResult: {
    border: '1px solid black',
    margin: 5,
    height: 200,
    padding: 18,
  },
  buttons: {
    height: 25,
    margin: 5,
    backgroundColor: 'lightgreen',
    borderRadius: 3,
  }
};

const mapStateToProps = (state, ownProps) => ({
  user: state.user,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  login: (user, password) => {
    dispatch(login({ user, password }));
  },
  searchPlayers: (userId) => {
    dispatch(searchPlayers({ userId }));
  }
});
export class Container extends Component {
  componentDidMount() {
    // Call login service
    this.props.login('Bob', 'Pass');
  }

  handleClick = () => {
    // Call matchmaking service
    this.props.searchPlayers(this.props.user.userId);
  }

  render() {
    const style = {
      width: '100vw',
      height: '100vh'
    };

    return (
      <div style={style}>
        <AutoSizer>
          {({ height, width }) => {
            const style = {
              width,
              height,
              display: 'flex',
            };

            return (
              <div
                style={style}
              >
                <div style={styles.leftPane}>
                  <button
                    style={styles.buttons}
                    onClick={this.handleClick}
                  >
                    Find a game
                  </button>
                  <div style={styles.divResult}>
                    <div>Welcome {this.props.user.name}</div>
                    <div>Searching for players and servers...</div>
                    <hr />
                  </div>
                </div>
                <div
                  style={styles.rightPane}
                />
              </div>
            );
          }}
        </AutoSizer>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Container);