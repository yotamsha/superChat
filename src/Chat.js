import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import {mockChannels} from './mocks';
import NavigationBar from './NavigationBar';
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

function getMainChannel(channels) {
  return channels[0];
}

function getOpenChannels(channels) {
  return channels;
}

function getPendingChannels(channels) {
  return channels;
}

class Chat extends Component {
  constructor(props) {
    super(props);
    this._channelAPI = new ChannelAPI();
    this.state = {
      currentChannel: getMainChannel(props.channels),
      openChannels: getOpenChannels(this.props.channels)
    };
  }

  static propTypes = {
    channels: PropTypes.arrayOf(channelType),
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired
    })
  }

  static defaultProps = {
    channels: mockChannels
  }

  switchChannel(channelId) {
    this.setState({
      currentChannel: _.find(this.state.openChannels, {id: channelId})
    })
  }

  async openNewChannel(parentChannel, users) {
    const channel = await this._channelAPI.createChannel(parentChannel, users)
    this.setState({
      openChannels: _.concat(this.state.openChannels, channel)
    })
  }

  async createMessage(channelId, message) {
    const channel = await this._channelAPI.addMessageToChannel(channelId, message, this.props.user.id);
    if (channelId === this.state.currentChannel.id) {
      this.setState({
        currentChannel: channel
      })
    }
  }

  render() {
    return (
      <div className="Chat">
        <NavigationBar
          switchChannel={this.switchChannel.bind(this)}
          openChannels={this.state.openChannels}
          pendingChannels={getPendingChannels(this.props.channels)}>
        </NavigationBar>

        <Channel
          id={this.state.currentChannel.id}
          openNewChannel={this.openNewChannel.bind(this)}
          createMessage={this.createMessage.bind(this)}
          name={this.state.currentChannel.title}
          messages={this.state.currentChannel.messages}
          users={this.state.currentChannel.users}>
        </Channel>

      </div>
    );
  }
}

export default Chat;
