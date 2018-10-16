import React, {Component} from 'react';
import PropTypes from 'prop-types';

class ChannelTab extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    messages: PropTypes.arrayOf(messageType),
    name: PropTypes.string.isRequired,
    isActive: PropTypes.bool.isRequired,
  }

  render() {
    return (
        <div className="channel-tab"></div>
    );
  }
}

export default ChannelTab;
