import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

const messageType = PropTypes.shape({
  id: PropTypes.string,
  text: PropTypes.string
})

const channelType = PropTypes.shape({
  id: PropTypes.string,
  name: PropTypes.string,
  messages: PropTypes.arrayOf(messageType),
})

class NavigationBar extends Component {
  static propTypes = {
    openChannels: PropTypes.arrayOf(channelType).isRequired,
    pendingChannels: PropTypes.arrayOf(channelType).isRequired,
    switchChannel: PropTypes.func.isRequired
  }

  render() {
    return (
      <div className="nav-bar">
        <h2>Open</h2>
        <ul className="open-channels">
          {_.map(this.props.openChannels, channel => (<li key={channel.id}>
            <button onClick={() => this.props.switchChannel(channel.id)}>{channel.title}</button>
            </li>))}
        </ul>

        <h2>Pending</h2>
        <ul className="pending-channels">
          {_.map(this.props.pendingChannels, channel => (<li key={channel.id}>
            <button onClick={() => this.props.switchChannel(channel.id)}>{channel.title}</button>
          </li>))}
        </ul>
      </div>
    );
  }
}

export default NavigationBar;
