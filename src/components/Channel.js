import React, {Component} from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import appPropTypes from './appPropTypes';

const {messageType, userType} = appPropTypes;

function getUsersStr(users) {
  return _.reduce(users, (str, user) => {
    str += user.username + ", "
    return str;
  }, '').slice(0, -2)
}

class Channel extends Component {
  constructor() {
    super();
    this.state = {
      newMessage: ''
    };
  }

  static propTypes = {
    id: PropTypes.string.isRequired,
    messages: PropTypes.arrayOf(messageType),
    members: PropTypes.arrayOf(userType),
    name: PropTypes.string,
    isActive: PropTypes.bool,
    openNewChannel: PropTypes.func.isRequired,
    createMessage: PropTypes.func.isRequired,
    onFocus: PropTypes.func,
    currentUser: userType
  };

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({behavior: "instant"});
  }

  submitMessage() {
    this.props.createMessage(this.props.id, this.state.newMessage);
    this.setState({newMessage: ''})
  }

  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  onInputFocus() {
    this.props.onFocus(this.props.id)
  }
  render() {
    return (
      <div className={`channel-tab ${this.props.isActive ? 'active' : ''}`} onClick={this.onInputFocus.bind(this)}>
        <div className="tab-header">
          <h3 className="channel-title">{`${getUsersStr(this.props.members)} - ${this.props.name || ''}`}</h3>
          <div className="tab-users">
          </div>
        </div>

        <div className="tab-messages">
          <ul className="messages">
            {_.map(this.props.messages, msg =>
              <li className="msg-row" key={msg.id}>
                {msg.user.id !== this.props.currentUser.id ? (<a className="username other"
                                                                 onClick={() => this.props.openNewChannel([this.props.currentUser.id, msg.user.id])}>{msg.user.username} > &nbsp;
                </a>) : <span className="username me"> {msg.user.username} > &nbsp;</span>} {msg.text}
              </li>)}
            <li id={this.props.id} ref={(el) => {
              this.messagesEnd = el;
            }}></li>
          </ul>

          <div className="message-input">
            <input value={this.state.newMessage} placeholder="" onFocus={this.onInputFocus.bind(this)}
                   onKeyPress={(e) => {
                     if (e.key === 'Enter') {
                       this.submitMessage()
                     }
                   }}
                   onChange={(event) => this.setState({newMessage: event.target.value})}></input>
            <button type="submit" onClick={this.submitMessage.bind(this)}>Send</button>
          </div>
        </div>
      </div>
    );
  }
}

export default Channel;
