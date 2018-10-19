import React, {Component} from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Channel from './Channel';
import NavigationBar from './NavigationBar';
import UserProfile from './UserProfile';
import ChannelAPI from './../model/ChannelAPI';
import appPropTypes from './appPropTypes';

const {channelType, userType} = appPropTypes;

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
    user: userType,
    loginUser: PropTypes.func.isRequired,
    authState: PropTypes.string.isRequired
  };

  static defaultProps = {
    channels: []
  };

  componentWillReceiveProps(newProps) {
    if (!this.state.activeTab || this.state.activeTab === 'login') {
      this.setState({
        activeTab: newProps.channels.length && newProps.channels[0].id
      });
    }
  }

  async openNewChannel(users) {
    if (this.props.user.id) {
      // todo Only allow to open a single channel with a user.
      const newChannel = await ChannelAPI.createChannel(users)
      this.setState({
        activeTab: newChannel.id
      });
    } else {
      this.promptUserDetailsDialogIfNeeded();
    }
  }

  async createMessage(channelId, message) {
    return ChannelAPI.addMessageToChannel(channelId, message, this.props.user);
  }

  async submitMessage(msg, channelId) {
    if (this.props.user.id) {
      return await this.createMessage(channelId, msg);
    }
    return false;
  }

  promptUserDetailsDialogIfNeeded() {
    if (!this.props.user.id) {
      this.setState({
        activeTab: 'login'
      });
    }
  }

  render() {
    const channel = _.find(this.props.channels, {id: this.state.activeTab});

    return (
      <div className="chat">
        <NavigationBar
          currentUser={this.props.user}
          channels={this.props.channels}
          activeTab={this.state.activeTab}
          onChannelSelected={switchActiveChannel.bind(this)}>
        </NavigationBar>
        {this.state.activeTab === 'login' &&
        <UserProfile user={this.props.user} loginUser={this.props.loginUser}></UserProfile>}

        {channel && (
          <Channel
            key={channel.id}
            id={channel.id}
            currentUser={this.props.user}
            openNewChannel={this.openNewChannel.bind(this)}
            onInputFocus={this.promptUserDetailsDialogIfNeeded.bind(this)}
            onSubmitMessage={this.submitMessage.bind(this)}
            onFocus={switchActiveChannel.bind(this)}
            name={channel.title}
            isPublic={channel.isPublic}
            messages={channel.messages}
            members={channel.members}>
          </Channel>)}
      </div>
    );
  }
}

export default Chat;
