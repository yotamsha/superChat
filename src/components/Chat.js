import React, {Component} from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Channel from './Channel';
import NavigationBar from './NavigationBar';
import UserProfile from './UserProfile';
import ChannelAPI from './../model/ChannelAPI';
import appPropTypes from './appPropTypes';
import UsersTab from "./UsersTab";

const {channelType, userType} = appPropTypes;

class Chat extends Component {
  constructor(props) {
    super(props);
    this.chosenUsername = props.user.username;
    this.state = {};
  }

  static propTypes = {
    channels: PropTypes.arrayOf(channelType),
    activeTab: PropTypes.string,
    openTabs: PropTypes.object,
    activeUsers: PropTypes.array,
    unreadChannels: PropTypes.object,
    user: userType,
    title: PropTypes.string,
    toggleChannelWindowExpanded: PropTypes.func.isRequired,
    switchActiveTab: PropTypes.func.isRequired,
    loginUser: PropTypes.func.isRequired,
    updateUser: PropTypes.func.isRequired,
    authState: PropTypes.string.isRequired
  };

  static defaultProps = {
    channels: []
  };

  isChannelWithSameUsersExists(userIds) {
    return this.props.channels.find(channel => {
      return _.difference(userIds, _.map(channel.members, 'id')).length === 0
    })
  }

  async openNewChannel(users) {
    if (this.props.user.id) {
      const channelWithSameUsers = this.isChannelWithSameUsersExists(users)
      if (channelWithSameUsers) {
        this.props.switchActiveTab(channelWithSameUsers.id)
        return
      }
      const newChannel = await ChannelAPI.createChannel(users);
      this.props.switchActiveTab(newChannel.id)
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
      this.props.switchActiveTab('login')
    }
  }

  render() {
    const channel = _.find(this.props.channels, {id: this.props.activeTab});

    return (
      <div className="chat">
        <div className="app-tabs">
          {channel && (
            <Channel
              key={channel.id}
              id={channel.id}
              currentUser={this.props.user}
              onFocus={this.props.switchActiveTab}
              name={this.props.title || channel.title}
              isPublic={channel.isPublic}
              messages={channel.messages}
              isCollapsed={channel.isCollapsed}
              members={channel.members}
              openNewChannel={this.openNewChannel.bind(this)}
              onInputFocus={this.promptUserDetailsDialogIfNeeded.bind(this)}
              onSubmitMessage={this.submitMessage.bind(this)}
              toggleChannelWindowExpanded={this.props.toggleChannelWindowExpanded} />)}

          {
            this.props.activeTab === 'login' &&
            <UserProfile user={this.props.user} updateUser={this.props.updateUser} loginUser={this.props.loginUser}></UserProfile>
          }
            <UsersTab currentUser={this.props.user}
                      isOpen={!!this.props.openTabs.usersList}
                      openNewChannel={this.openNewChannel.bind(this)}
                      activeUsers={this.props.activeUsers}>
            </UsersTab>


        </div>

        <NavigationBar
          openTabs={this.props.openTabs}
          title={this.props.title}
          unreadChannels={this.props.unreadChannels}
          currentUser={this.props.user}
          channels={this.props.channels}
          activeTab={this.props.activeTab}
          onTabSelected={this.props.switchActiveTab}>
        </NavigationBar>
      </div>
    );
  }
}

export default Chat;
