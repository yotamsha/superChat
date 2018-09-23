import _ from 'lodash';
import React, {Component} from 'react';
import UserContext from './contexts/UserContext';
import Chat from './Chat';
import './App.css';
import ChannelAPI from './model/ChannelAPI'

/**
 *
 * TODOS
 *
 * 1) handle case where there is no space for displaying all conversations (facebook only show the last opened chats to
 * a certain number and then when you close certain chat it shows those that were previously opened instead)
 *
 * 2) show all members of a chat
 *
 * 3) Split to public and private channels (customerId is initialized with one main public channel by default configuration)
 *
 * 4) Work on UI:
 * - a cool feature could be that when hovering on a username you can choose to start a private channel
 * or add to an open existing channel
 * - Before user picks a username - he should be able to see all the recently active public channels.
 * only when he is about to write we ask him for his username.
 *
 * 5) Show channels according to tenantId and userId - user will only see chats he is part of and the main channel
 * of the current tenant.
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

function addMessagesListeners(channels) {
  // TODO add / remove listeners to channel changes
  // listen to changes to any messages on the open channels
  channels.forEach(channel => {
    ChannelAPI.onChannelMessagesChanges(channel.id, messages => {
      messages = _.sortBy(messages, 'createdAt');
      this.setState({
        channels: updateItemInCollection(this.state.channels, {id: channel.id, messages})
      });
    })
  })
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      channels: []
    };

    // listen to any changes in the channels list
    ChannelAPI.onChanges((updatedData) => {
      const updatedChannels = mergeCollectionChanges(this.state.channels, updatedData);
      addMessagesListeners.call(this, updatedChannels);
      this.setState({
        channels: _(updatedChannels).sortBy('createdAt').reverse().value()
      });
    })

  }
  render() {
    return (
      <div className="App">
        <UserContext.Consumer>
          {({user}) => (
            <Chat user={user} channels={this.state.channels}></Chat>
          )}
        </UserContext.Consumer>
      </div>
    );
  }
}

export default App;
