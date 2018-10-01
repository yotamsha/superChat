import React, {Component} from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

const messageType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  text: PropTypes.string
})

class Channel extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    messages: PropTypes.arrayOf(messageType),
    createMessage: PropTypes.func.isRequired,
  }

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({behavior: "smooth"});
  }

  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  render() {
    return (
      <div className="tab-messages">
        <ul className="messages">
          {_.map(this.props.messages, msg =>
            <li className="msg-row" key={msg.id}><span
              className="username">{msg.user.username} > &nbsp;</span> {msg.text}
            </li>)}
          <li ref={(el) => {
            this.messagesEnd = el;
          }}></li>
        </ul>

        <div className="message-input">
          <input placeholder="Write something here.."
                 onBlur={(event) => this.setState({newMessage: event.target.value})}></input>
          <button type="submit" onClick={() => this.props.createMessage(this.props.id, this.state.newMessage)}>Send
          </button>
        </div>
      </div>
    );
  }
}

export default Channel;
