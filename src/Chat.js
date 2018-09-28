import React, {Component} from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import sessionProvider from './services/sessionProvider';
import Channel from './Channel';
import ChannelAPI from './model/ChannelAPI';

const messageType = PropTypes.shape({
  id: PropTypes.string,
  text: PropTypes.string
})

const channelType = PropTypes.shape({
  id: PropTypes.string,
  name: PropTypes.string,
  messages: PropTypes.arrayOf(messageType),
})

function switchActiveChannel(channelId) {
  this.setState({
    activeTab: channelId
  })
}

class Chat extends Component {
  constructor(props) {
    super(props);

    this.chosenUsername = props.user.username;
    this.state = {};
  }

  static propTypes = {
    channels: PropTypes.arrayOf(channelType),
    user: PropTypes.shape({
      id: PropTypes.string,
      username: PropTypes.string.isRequired
    }),
    loginUser: PropTypes.func.isRequired
  }

  static defaultProps = {
    channels: []
  }

  componentWillReceiveProps(newProps) {
    if (!this.state.activeTab) {
      this.setState({
        activeTab: newProps.channels.length && newProps.channels[0].id
      });
    }
  }

  async openNewChannel(users) {
    // todo Only allow to open a single channel with a user.
    return await ChannelAPI.createChannel(users)
  }

  async createMessage(channelId, message) {
    return ChannelAPI.addMessageToChannel(channelId, message, this.props.user);
  }
  // TODO show some public channels and some private channels according to configuration -
  // TODO public channels can have some UI which allows to navigate between them.

  render() {
    return (
      <div className="chat">
        {!this.props.user.id && (<div className="user-tab">
          Hey, put your name here.
          <br/>
          <br/>
          <input defaultValue={this.props.user.username} onBlur={(event) => {this.chosenUsername = event.target.value}}></input>
          <button type="submit" onClick={() => this.props.loginUser(this.chosenUsername)}>Send</button>
        </div>)}
        {this.props.user.id && _.map(this.props.channels, channel => (
          <Channel
            key={channel.id}
            id={channel.id}
            currentUser={this.props.user}
            openNewChannel={this.openNewChannel.bind(this)}
            createMessage={this.createMessage.bind(this)}
            onFocus={switchActiveChannel.bind(this)}
            name={channel.title}
            isActive={channel.id === this.state.activeTab}
            messages={channel.messages}
            members={channel.members}>
          </Channel>
        ))}
      </div>
    );
  }
}

export default Chat;
