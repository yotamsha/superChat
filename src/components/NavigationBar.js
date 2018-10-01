import React, {Component} from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import appPropTypes from './appPropTypes';

const {channelType} = appPropTypes;

function getUsersStr(users) {
  return _.reduce(users, (str, user) => {
    str += user.username + ", "
    return str;
  }, '').slice(0, -2)
}

class NavigationBar extends Component {
  static propTypes = {
    channels: PropTypes.arrayOf(channelType),
    onChannelSelected: PropTypes.func.isRequired,
    activeChannel: PropTypes.string,
  }
  
  render() {
    return (
        <div className="nav-bar">
          <div className="pinned-tabs-container">
            <button className="nav-btn channels">Channels</button>
            <button className="nav-btn members">Members</button>
          </div>
          <div className="channel-tabs">
            {_.map(this.props.channels, channel => (
                <button key={channel.id}
                        className={`nav-btn channel ${channel.id === this.props.activeChannel ? 'active' : ''}`}
                        onClick={() => this.props.onChannelSelected(channel.id)}>
                  <span className="hashtag">#</span>{channel.title || getUsersStr(channel.members)}
                </button>
            ))}
          </div>
        </div>
  );

    // <ChannelTab
    //     key={channel.id}
    //     id={channel.id}
    //     name={channel.title}
    //     isActive={channel.id === this.state.activeTab}
    //     messages={channel.messages}
    //     members={channel.members}>
    // </ChannelTab>
  }
}

export default NavigationBar;
