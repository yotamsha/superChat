import React, {Component} from 'react';
import UserContext from './contexts/UserContext';
import Chat from './Chat';
// import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <UserContext.Consumer>
          {({user}) => (
            <Chat user={user}></Chat>
          )}
        </UserContext.Consumer>
      </div>
    );
  }
}

export default App;
