import _ from 'lodash';
import React, {Component} from 'react';
import Chat from './Chat';
import './App.css';
import ChannelAPI from './../model/ChannelAPI'
import UserAPI from "./../model/UserAPI";
import sessionProvider from "./../services/sessionProvider";
import configProvider from './../services/configProvider'
import constants from './../utils/constants'
const {AUTH_STATES} = constants;

const config = configProvider.getConfig();
/**
 *
 * TODOS
 *
 * 1) handle case where there is no space for displaying all conversations (facebook only show the last opened chats to
 * a certain number and then when you close certain chat it shows those that were previously opened instead)
 *
 * 4) Work on UI:
 * - a cool feature could be that when hovering on a username you can choose to start a private channel
 * or add to an open existing channel
 * - Before user picks a username - he should be able to see all the recently active public channels.
 * only when he is about to write we ask him for his username.
 *
 *
 * 6) Only allow to open a single channel with each user.
 *
 * 7) When a user is logged-in to a tenant and switches to another tenant he is not does not have a session but he does have
 * a store session. I can decide that for now the authentication will be across tenants but
 * eventually I want the tenants to be completely separate.
 * - My issue is that when I log out from one tenant I lose the token of the last one.
 * Maybe I can solve it by generating my own tokens and signIn with these custom tokens.
 */
function updateItemInCollection(collection, updatedItem) {
  const updatedCollection = _.cloneDeep(collection)
  const index = _.findIndex(updatedCollection, {id: updatedItem.id});
  if (index >= 0) {
    updatedCollection[index] = _.assign({}, updatedCollection[index], updatedItem);
  } else {
    updatedCollection.push(updatedItem);
    //console.warn('tried to updated item with non-existing id: ' + updatedItem.id)
  }
  return updatedCollection;
}
/**
 * Add
 * @param collection
 * @param updatedCollection
 */
function mergeCollectionChanges(collection, updatedCollection) {
  return _.reduce(updatedCollection, (acc, updatedItem) => {
    acc = updateItemInCollection(acc, updatedItem);
    return acc;
  }, collection)

}

function getRelevantChannels(allChannels) {
  const MAX_PRIVATE_CHATS = 10;
  const MAX_PUBLIC_CHATS = 1;
  const publicChannels = _(allChannels).filter('isPublic').takeRight(MAX_PUBLIC_CHATS).value();
  const privateChannels = _(allChannels).reject('isPublic').sortBy('createdAt').reverse().takeRight(MAX_PRIVATE_CHATS).value();
  return _.concat(publicChannels, privateChannels);

}

function getMainChannel(channels) {
  return channels.length && channels[0].id;

}

function channelsDataRetrieved(updatedData) {
  const updatedChannels = mergeCollectionChanges(this.state.channels, updatedData);
  addMessagesListeners.call(this, updatedChannels);
  const newState = {
    allChannels: updatedChannels,
    channels: getRelevantChannels(updatedChannels)
  };
  if (!this.state.activeTab) {
    newState.activeTab = getMainChannel(newState.channels)
  }
  this.setState(newState);
}

function addMessagesListeners(channels) {
  // TODO add / remove listeners to channel changes
  // listen to changes to any messages on the open channels
  channels.forEach(channel => {
    ChannelAPI.onChannelMessagesChanges(channel.id, messages => {
      messages = _.sortBy(messages, 'createdAt');
      const updatedChannels = updateItemInCollection(this.state.allChannels, {id: channel.id, messages});
      // don't set unread notification on activeTab.
      const updatedUnreadChannels = (channel.id !== this.state.activeTab) ? _.assign({}, this.state.unreadChannels, {[channel.id]: true}) : this.state.unreadChannels;
      this.setState({
        unreadChannels: updatedUnreadChannels,
        allChannels: updatedChannels,
        channels: getRelevantChannels(updatedChannels)
      });
    })
  })
}

function switchActiveTab(tabId) {
  if (tabId === 'login') {
    this.setState({
      activeTab: tabId
    })
    return;
  }
  this.setState({
    activeTab: tabId,
    channels: updateItemInCollection(this.state.channels, {id: tabId, isCollapsed: false }),
    unreadChannels: _.assign({}, this.state.unreadChannels, {[tabId]: false})
  })

}

async function listenToUserChanges() {
  UserAPI.onAuthStateChanged(async user => {
    console.log('Current User: ', user)
    if (user) {
      // if we are in first-load state:
      if (this.state.authState === AUTH_STATES.PRE_INIT) {
        // we will check if user has an existing session, if not, we will signout.
        const isValidSession = UserAPI.validateSession(user.uid);
        if (isValidSession) {
          this.setState({
            authState: AUTH_STATES.LOGGED_IN,
            currentUser: _.assign({}, UserAPI.getCurrentUser(), {id: user.uid})
          });
          ChannelAPI.onPrivateChannelsChanges(user.uid, channelsDataRetrieved.bind(this))
        } else {
          this.setState({
            authState: AUTH_STATES.LOGGED_OUT
          });
        }
        return;
      }
      // if we are in a pending login state
      if (this.state.authState === AUTH_STATES.PENDING_LOGIN) {
        // create or update the user in the collection.
        const newUser = _.assign({}, this.state.currentUser, {id: user.uid}, this.newUserDetails);
        await UserAPI.createUser(newUser);
        sessionProvider.set(config.appId, JSON.stringify({user: newUser}));
        this.setState({
          currentUser: newUser,
          authState: AUTH_STATES.LOGGED_IN
        })
        ChannelAPI.onPrivateChannelsChanges(this.state.currentUser.id, channelsDataRetrieved.bind(this))
        return;
      }
    } else {
      this.setState({
        authState: AUTH_STATES.LOGGED_OUT
      });
      console.log('User logged out.')
    }
  })
}

async function loginUser(userDetails) {
  this.newUserDetails = userDetails;

  this.setState({
    activeTab: getMainChannel(this.state.channels),
    authState: AUTH_STATES.PENDING_LOGIN
  });

  return await UserAPI.login()
}

async function updateUser(user) {
  const updatedUser = await UserAPI.updateUser(user)
  sessionProvider.set(config.appId, JSON.stringify({user: updatedUser}));
  this.setState({
    activeTab: getMainChannel(this.state.channels),
    currentUser: updatedUser
  });
}

async function toggleChannelWindowExpanded(channelId, removeChat) {
  let updatedChannels;

  if (removeChat) {
    await ChannelAPI.removeChannel(channelId);
    updatedChannels = _.filter(this.state.channels, channel => channel.id !== channelId);
  } else {
    const isCollapsed = _.find(this.state.channels, {id: channelId}).isCollapsed;
    updatedChannels = updateItemInCollection(this.state.channels, {id: channelId, isCollapsed: !isCollapsed })
  }
  this.setState({
    channels: updatedChannels
  });
}
class App extends Component {
  constructor() {
    super();
    this.state = {
      unreadChannels: {},
      activeTab: '',
      authState: AUTH_STATES.PRE_INIT,
      channels: [],
      uiProps: config.uiProps || {},
      currentUser: UserAPI.getDefaultUser()
    };

    listenToUserChanges.call(this);
    // listen to any changes in the channels list
    ChannelAPI.onPublicChannelsChanges(channelsDataRetrieved.bind(this));
  }
  
  render() {
    return (
      <div className={`App ${this.state.uiProps.theme}`}>
        <Chat user={this.state.currentUser}
              channels={this.state.channels}
              authState={this.state.authState}
              unreadChannels={this.state.unreadChannels}
              activeTab={this.state.activeTab}
              toggleChannelWindowExpanded={toggleChannelWindowExpanded.bind(this)}
              switchActiveTab={switchActiveTab.bind(this)}
              loginUser={loginUser.bind(this)}
              updateUser={updateUser.bind(this)}>
        </Chat>
      </div>
    );
  }
}

export default App;
