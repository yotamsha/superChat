import React, {Component} from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import appPropTypes from './appPropTypes';
import FontAwesome from 'react-fontawesome';
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'

const {messageType, userType} = appPropTypes;

function getUsersStr(currentUserId, users) {
  // return _.reduce(users, (str, user) => {
  //   str += user.username + ", "
  //   return str;
  // }, '').slice(0, -2)
  if (!users) {
    return '';
  }
  const otherUser = _.find(users, user => user.id !== currentUserId)
  return 'Me, ' + otherUser.username;
}

class Channel extends Component {
  constructor() {
    super();
    this.currentMessage = '';
    this.state = {
      emojisListOpen: false
    };
  }

  static propTypes = {
    id: PropTypes.string.isRequired,
    messages: PropTypes.arrayOf(messageType),
    members: PropTypes.arrayOf(userType),
    name: PropTypes.string,
    isPublic: PropTypes.bool,
    isActive: PropTypes.bool,
    isCollapsed: PropTypes.bool,
    toggleChannelWindowExpanded: PropTypes.func.isRequired,
    openNewChannel: PropTypes.func.isRequired,
    onSubmitMessage: PropTypes.func.isRequired,
    onInputFocus: PropTypes.func.isRequired,
    onFocus: PropTypes.func,
    currentUser: userType
  };

  scrollToBottom() {
    const scrollHeight = this.messageList.scrollHeight;
    const height = this.messageList.clientHeight;
    const maxScrollTop = scrollHeight - height;
    this.messageList.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
  }

  async submitMessage(msg, channelId) {
    if (!this.props.currentUser.id) {
      this.props.onInputFocus();
      return;
    }

    await this.props.onSubmitMessage(msg, channelId);
    this.currentMessage = ''
    this.messageInputRef.value = ''
    this.setState({
      emojisListOpen: false
    })
  }

  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  getTitle() {
    if (this.props.isPublic) {
      return this.props.name || '';
    }
    return getUsersStr(this.props.currentUser.id, this.props.members)
  }

  openCloseEmojisList() {
    this.setState({
      emojisListOpen: !this.state.emojisListOpen
    })
  }

  addChar(char) {
    this.messageInputRef.value = this.messageInputRef.value += char;
    this.currentMessage = this.messageInputRef.value;
  }

  render() {
    return (
      <div className={`app-tab channel-tab ${this.props.isCollapsed ? 'collapsed' : ''} ${this.props.isCollapsed === false ? 'expanded' : ''} ${this.props.isActive ? 'active' : ''}`}>
        <div className="tab-header">
          <h3 className="tab-title">{`${this.getTitle()}`}</h3>
          <div className="header-actions-btns">
            {!this.props.isPublic &&
            <button className="btn close" onClick={() => this.props.toggleChannelWindowExpanded(this.props.id, true)}>
              <FontAwesome name='close' />
            </button>}
            <button className="btn minimize" onClick={() => this.props.toggleChannelWindowExpanded(this.props.id)}>
              <FontAwesome name='window-minimize' />
            </button>
          </div>
        </div>

        <div className="tab-messages">
          <ul className="messages" ref={(el) => this.messageList = el}>
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
          </ul>
          <div className={'emojis-list ' + (this.state.emojisListOpen ? 'open' : '')}>
            <div className="list-container">
              <Picker showPreview="false" onSelect={emoji => this.addChar(emoji.native)} color="#3F51B5"/>
            </div>
          </div>
          <div className="message-input">
            <input defaultValue={this.currentMessage} placeholder="Type your message"
                   ref={(ref) => this.messageInputRef= ref}
                   onKeyPress={(e) => {
                     if (e.key === 'Enter') {
                       this.submitMessage(this.currentMessage, this.props.id)
                     }
                   }}
                   onChange={(event) => this.currentMessage = event.target.value}></input>
            <button className="emojis-btn" onClick={this.openCloseEmojisList.bind(this)}><FontAwesome name='smile-o'/></button>
            <button type="submit" onClick={() => this.submitMessage(this.currentMessage, this.props.id)}>
              <FontAwesome name='send' />
            </button>
          </div>

        </div>
      </div>
    );
  }
}

export default Channel;
