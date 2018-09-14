import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

const messageType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  text: PropTypes.string
})

const userType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired
})

class Channel extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    messages: PropTypes.arrayOf(messageType),
    users: PropTypes.arrayOf(userType),
    name: PropTypes.string.isRequired,
    openNewChannel: PropTypes.func.isRequired,
    createMessage: PropTypes.func.isRequired,
  }

  render() {
    return (
      <div className="channel">
        <h1>{this.props.name}</h1>
        <h2>Users</h2>
        <ul className="users">
          {_.map(this.props.users, user =>
            <li key={user.id}>
              {user.firstName} {user.lastName}
              </li>)}
        </ul>
        <h2>Messages</h2>
        <ul className="messages">
          {_.map(this.props.messages, msg =>
            <li key={msg.id}>{msg.text},
              by: <button onClick={() => this.props.openNewChannel(this.props.id, [msg.user.id])}>
                {msg.user.firstName} {msg.user.lastName}
                </button>
            </li>)}
        </ul>

        <input placeholder="Write something here.." onBlur={(event) => this.setState({newMessage: event.target.value})}></input>
        <button type="submit" onClick={() => this.props.createMessage(this.props.id, this.state.newMessage)}>Send</button>

      </div>
    );
  }
}

export default Channel;
