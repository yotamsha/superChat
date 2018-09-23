import _ from 'lodash';
import React, {Component} from 'react';
import UserContext from './contexts/UserContext';
import Chat from './Chat';
// import logo from './logo.svg';
import './App.css';
import ChannelAPI from './model/ChannelAPI'

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
        channels: updatedChannels
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
