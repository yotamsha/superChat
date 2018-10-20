import React, {Component} from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import appPropTypes from './appPropTypes';

const {channelType, userType} = appPropTypes;

function getUsersStr(users, currentUser) {
  const otherUsers = _.filter(users, user => user.id !== currentUser.id);
  return _.reduce(otherUsers, (str, user) => {
    str += user.username + ", "
    return str;
  }, '').slice(0, -2)
}

function getNavBtnClasses(channel) {
  return `nav-btn channel ${channel.id === this.props.activeTab ? 'active' : ''}`;
}

class NavigationBar extends Component {
  static propTypes = {
    currentUser: userType,
    unreadChannels: PropTypes.object,
    channels: PropTypes.arrayOf(channelType),
    onChannelSelected: PropTypes.func.isRequired,
    activeTab: PropTypes.string,
  }

  render() {
    return (
      <div className="nav-bar">
        <div className="pinned-tabs-container">
          <div className="nav-btn-container">
            <button onClick={() => this.props.onChannelSelected('login')}
                    className={`nav-btn channels ${this.props.activeTab === 'login' ? 'active' : ''}`}>Profile
            </button>
          </div>
        </div>
        <div className="channel-tabs">
          {_.map(this.props.channels, channel => (
            <div className="nav-btn-container">
              <button key={channel.id}
                      className={getNavBtnClasses.call(this, channel)}
                      onClick={() => this.props.onChannelSelected(channel.id)}>
                <span className="hashtag">{channel.isPublic ? '# ' : ''}</span>
                {channel.title || getUsersStr(channel.members, this.props.currentUser)}
              </button>
              {this.props.unreadChannels[channel.id] && <div className="unread-indicator"></div>}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default NavigationBar;
