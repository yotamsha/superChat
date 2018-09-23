import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

const messageType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  text: PropTypes.string
})

const userType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired
})

function getUsersStr(users) {
  return _.reduce(users, (str, user)=> {
    str += user.username + ", "
    return str;
  }, '')
}
class Channel extends Component {
  constructor() {
    super();
  }
  static propTypes = {
    id: PropTypes.string.isRequired,
    messages: PropTypes.arrayOf(messageType),
    users: PropTypes.arrayOf(userType),
    name: PropTypes.string.isRequired,
    openNewChannel: PropTypes.func.isRequired,
    createMessage: PropTypes.func.isRequired,
  }

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: "instant" });
  }

  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  render() {
    return (
      <div className="channel-tab">
        <div className="tab-header">
          <h3 className="channel-title">{this.props.name}</h3>
          <div className="tab-users">
            <span className="users">
              {getUsersStr(this.props.users)}
            </span>
          </div>
        </div>

        <div className="tab-messages">
          <ul className="messages">
            {_.map(this.props.messages, msg =>
              <li className="msg-row" key={msg.id}><a className="username" onClick={() => this.props.openNewChannel(this.props.id, [msg.user.id])}>{msg.user.username} > &nbsp;</a> {msg.text}
                {/*by: <button onClick={() => this.props.openNewChannel(this.props.id, [msg.user.id])}>*/}
                  {/*{msg.user.firstName} {msg.user.lastName}*/}
                {/*</button>*/}
              </li>)}
              <li id={this.props.id} ref={(el) => { this.messagesEnd = el; }}></li>
          </ul>

          <div className="message-input">
            <input placeholder="Write something here.." onBlur={(event) => this.setState({newMessage: event.target.value})}></input>
            <button type="submit" onClick={() => this.props.createMessage(this.props.id, this.state.newMessage)}>Send</button>
          </div>
        </div>
      </div>
    );
  }
}

export default Channel;
