import React, {Component} from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import appPropTypes from './appPropTypes';
import FontAwesome from 'react-fontawesome';

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
    isPublic: PropTypes.bool,
    isActive: PropTypes.bool,
    openNewChannel: PropTypes.func.isRequired,
    onSubmitMessage: PropTypes.func.isRequired,
    onInputFocus: PropTypes.func.isRequired,
    onFocus: PropTypes.func,
    currentUser: userType
  };

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({behavior: "instant"});
  }

  async submitMessage(msg, channelId) {
    await this.props.onSubmitMessage(msg, channelId);
    this.setState({newMessage: ''})
  }

  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  onInputFocus() {
    this.props.onInputFocus();
  }

  getTitle() {
    if (this.props.isPublic) {
      return this.props.name || '';
    }
    return getUsersStr(this.props.members)
  }

  render() {
    return (
      <div className={`app-tab channel-tab ${this.props.isActive ? 'active' : ''}`} onClick={this.onInputFocus.bind(this)}>
        <div className="tab-header">
          <h3 className="tab-title">{`${this.getTitle()}`}</h3>
          <div className="tab-users">
          </div>
        </div>

        <div className="tab-messages">
          <ul className="messages">
            {_.map(this.props.messages, msg => {
              const ownerMsg = msg.user.id === this.props.currentUser.id;

              return <li className={'msg-row ' + (ownerMsg ? 'me' : '')} key={msg.id}>
                <div className="msg-content">
                  {ownerMsg ? '' :
                    (<a className="username other"
                        onClick={() => this.props.openNewChannel([this.props.currentUser.id, msg.user.id])}>
                      {msg.user.username}</a>)}
                  {msg.text}
                </div>
              </li>
            })}
            <li ref={(el) => {
              this.messagesEnd = el;
            }}></li>
          </ul>

          <div className="message-input">
            <input value={this.state.newMessage} placeholder="Type your message" onFocus={this.onInputFocus.bind(this)}
                   onKeyPress={(e) => {
                     if (e.key === 'Enter') {
                       this.submitMessage(this.state.newMessage, this.props.id)
                     }
                   }}
                   onChange={(event) => this.setState({newMessage: event.target.value})}></input>
            <button type="submit" onClick={() => this.submitMessage(this.state.newMessage, this.props.id)}>
              <FontAwesome name='send' />
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Channel;
