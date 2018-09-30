import _ from 'lodash';
import React, {Component} from 'react';
import Chat from './Chat';
import './App.css';
import ChannelAPI from './model/ChannelAPI'
import UserAPI from "./model/UserAPI";
import sessionProvider from "./services/sessionProvider";
import config from './config'

/**
 *
 * TODOS
 *
 * 1) handle case where there is no space for displaying all conversations (facebook only show the last opened chats to
 * a certain number and then when you close certain chat it shows those that were previously opened instead)
 *
 * 2) show all members of a chat
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
 * 7) Support injecting the code as a 3rd-party html tag. (iframe ? )
 */
function updateItemInCollection(collection, updatedItem) {
  const updatedCollection = _.cloneDeep(collection)
  const index = _.findIndex(updatedCollection, {id: updatedItem.id});
  if (index >= 0) {
    updatedCollection[index] = _.assign(updatedCollection[index], updatedItem);
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
  const publicChannels = _(allChannels).filter('isPublic').takeRight(1).value();
  const privateChannels = _(allChannels).reject('isPublic').sortBy('createdAt').takeRight(3).value();
  return _.concat(publicChannels, privateChannels);

}
function channelsDataRetrieved(updatedData) {
  const updatedChannels = mergeCollectionChanges(this.state.channels, updatedData);
  addMessagesListeners.call(this, updatedChannels);
  this.setState({
    allChannels: updatedChannels,
    channels: getRelevantChannels(updatedChannels)
  });
}

function addMessagesListeners(channels) {
  // TODO add / remove listeners to channel changes
  // listen to changes to any messages on the open channels
  channels.forEach(channel => {
    ChannelAPI.onChannelMessagesChanges(channel.id, messages => {
      messages = _.sortBy(messages, 'createdAt');
      const updatedChannels = updateItemInCollection(this.state.allChannels, {id: channel.id, messages});
      this.setState({
        allChannels: updatedChannels,
        channels: getRelevantChannels(updatedChannels)
      });
    })
  })
}
async function listenToUserChanges() {
  UserAPI.onAuthStateChanged(async user => {
    console.log('Current User: ', user)
    if (user) {
      // if we are in first-load state:
      if (this.authState === 'preInit') {
        // we will check if user has an existing session, if not, we will signout.
        UserAPI.validateSession(user);
        return;
      }
      // if we are in a pending login state
      if (this.authState === 'pendingLogin') {
        this.authState = 'loggedIn';
        // create or update the user in the collection.
        const newUser = _.assign({}, this.state.currentUser, {id: user.uid, username: this.newUserDetails.username});
        await UserAPI.createUser(newUser);
        sessionProvider.set(config.defaultTenantId, JSON.stringify({user: newUser}));
        this.setState({
          currentUser: newUser
        })
        ChannelAPI.onPrivateChannelsChanges(this.state.currentUser.id, channelsDataRetrieved.bind(this))
        return;
      }

    } else {
      console.log('User logged out.')
    }
  })
}

async function loginUser(username) {
  this.newUserDetails = {
    username
  };
  this.authState = 'pendingLogin';
  return UserAPI.login()
}

class App extends Component {
  constructor() {
    super();
    this.authState = 'preInit';
    this.state = {
      channels: [],
      currentUser: UserAPI.getCurrentUser()
    };

    listenToUserChanges.call(this);
    // listen to any changes in the channels list
    ChannelAPI.onPublicChannelsChanges(channelsDataRetrieved.bind(this))
    if (this.state.currentUser.id) {
      ChannelAPI.onPrivateChannelsChanges(this.state.currentUser.id, channelsDataRetrieved.bind(this))
    }
  }
  render() {
    return (
      <div className="App">
        <Chat user={this.state.currentUser} channels={this.state.channels} loginUser={loginUser.bind(this)}></Chat>
      </div>
    );
  }
}

export default App;
