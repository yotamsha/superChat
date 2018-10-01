import React, {Component} from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Channel from './Channel';
import NavigationBar from './NavigationBar';
import ChannelAPI from './../model/ChannelAPI';
import constants from './../utils/constants';
import appPropTypes from './appPropTypes';

const {AUTH_STATES} = constants;
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

    render() {
        const channel = _.find(this.props.channels, {id: this.state.activeTab});

        return (
            <div className="chat">
                <NavigationBar channels={this.props.channels} activeChannel={this.state.activeTab} onChannelSelected={switchActiveChannel.bind(this)}></NavigationBar>
                
                {this.props.authState === AUTH_STATES.LOGGED_OUT && (<div className="user-tab">
                    Hey, put your name here.
                    <br/>
                    <input defaultValue={this.props.user.username}
                           onBlur={(event) => {this.chosenUsername = event.target.value}}></input>
                    <button type="submit" onClick={() => this.props.loginUser(this.chosenUsername)}>Send</button>
                </div>)}
                { channel && (
                    <Channel
                        key={channel.id}
                        id={channel.id}
                        currentUser={this.props.user}
                        openNewChannel={this.openNewChannel.bind(this)}
                        createMessage={this.createMessage.bind(this)}
                        onFocus={switchActiveChannel.bind(this)}
                        name={channel.title}
                        messages={channel.messages}
                        members={channel.members}>
                    </Channel>)}
            </div>
        );
    }
}

export default Chat;
