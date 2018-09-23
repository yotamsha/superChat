import React, {Component} from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import sessionProvider from './services/sessionProvider';
import Channel from './Channel';
import ChannelAPI from './model/ChannelAPI';
import UserAPI from "./model/UserAPI";

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

    this.chosenUsername = props.user.username;
    this.state = {
      currentChannel: getMainChannel(props.channels),
      openChannels: getOpenChannels(this.props.channels),
      user: props.user
    };
  }

  static propTypes = {
    channels: PropTypes.arrayOf(channelType),
    user: PropTypes.shape({
      id: PropTypes.string,
      username: PropTypes.string.isRequired
    })
  }

  static defaultProps = {
    channels: []
  }

  // switchChannel(channelId) {
  //   this.setState({
  //     currentChannel: _.find(this.state.openChannels, {id: channelId})
  //   })
  // }

  async openNewChannel(parentChannel, users) {
    // todo Only allow to open a single channel with a user.
    return await ChannelAPI.createChannel(parentChannel, users)
  }

  async createMessage(channelId, message) {
    return ChannelAPI.addMessageToChannel(channelId, message, this.state.user);
  }

  async loginUser(username) {
    UserAPI.onAuthStateChanged((user) => {
      if (user) {
        console.log('user logged!', user)
        const newUser = _.assign({}, this.state.user, {id: user.uid, username});
        sessionProvider.set('user', JSON.stringify(newUser))
        this.setState({
          user: newUser
        })
      } else {
        console.error('User logged out.')
      }

    });

    return UserAPI.login()
  }

  render() {
    return (
      <div className="chat">
        {/*<NavigationBar*/}
        {/*switchChannel={this.switchChannel.bind(this)}*/}
        {/*openChannels={this.state.openChannels}*/}
        {/*pendingChannels={getPendingChannels(this.props.channels)}>*/}
        {/*</NavigationBar>*/}
        {!this.state.user.id && (<div className="user-tab">
          Hey, put your name here.
          <br/>
          <br/>
          <input defaultValue={this.state.user.username} onBlur={(event) => {this.chosenUsername = event.target.value}}></input>
          <button type="submit" onClick={() => this.loginUser(this.chosenUsername)}>Send</button>
        </div>)}
        {this.state.user.id && _.map(this.props.channels, channel => (
          <Channel
            key={channel.id}
            id={channel.id}
            currentUser={this.state.user}
            openNewChannel={this.openNewChannel.bind(this)}
            createMessage={this.createMessage.bind(this)}
            name={channel.title}
            messages={channel.messages}
            users={channel.users}>
          </Channel>
        ))}
      </div>
    );
  }
}

export default Chat;
