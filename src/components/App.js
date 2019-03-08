import _ from 'lodash';
import React, {Component} from 'react';
import Chat from './Chat';
import './App.css';
import ReportAPI from './../model/ReportAPI'
import ChannelAPI from './../model/ChannelAPI'
import WidgetAPI from './../model/WidgetAPI'
import UserAPI from "./../model/UserAPI";
import sessionProvider from "./../services/sessionProvider";
import configProvider from './../services/configProvider'
import constants from './../utils/constants'
const {AUTH_STATES, MOBILE_WIDTH} = constants;

//const config = configProvider.getConfig();
/**
 *
 * TODOS
 *
 * When a user is logged-in to a tenant and switches to another tenant he does not have a session but he does have
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

function widgetDataChanged(data) {
  if (data.widgetProps) {
    this.setState({
      uiProps: JSON.parse(data.widgetProps)
    })
  } else {
    this.setState({
      uiProps: configProvider.getConfig().uiProps || {}
    })

  }
}

function addMessagesListeners(channels) {
  // TODO add / remove listeners to channel changes
  // listen to changes to any messages on the open channels
  channels.forEach(channel => {
    ChannelAPI.onChannelMessagesChanges(channel.id, messages => {
      messages = _.sortBy(messages, 'createdAt');

      const currentChannel = this.state.channels.find(c => channel.id === c.id)
      const updatedChannels = updateItemInCollection(this.state.allChannels, {
        id: channel.id,
        messages,
        isCollapsed: currentChannel && currentChannel.isCollapsed
      });
      // don't set unread notification on activeTab.
      const updatedUnreadChannels = (channel.id !== this.state.activeTab) ?
        _.assign({}, this.state.unreadChannels, {[channel.id]: true}) :
        this.state.unreadChannels;
      this.setState({
        unreadChannels: updatedUnreadChannels,
        allChannels: updatedChannels,
        channels: getRelevantChannels(updatedChannels)
      });
    })
  })
}

function listenToUsersChanges() {
  UserAPI.onUsersChanges(users => {
    this.setState({
      activeUsers: users
    });
  })
}

function isMobileDevice() {
  const width = window.innerWidth
  || document.documentElement.clientWidth
  || document.body.clientWidth;

  return width <= MOBILE_WIDTH
}

function switchActiveTab(tabId) {
  if (tabId === 'usersList') {
    this.setState({
      openTabs: {
        usersList : !this.state.openTabs.usersList
      }
    })
    return;
  }
  if (isMobileDevice()) {
    this.setState({
      openTabs: {
        usersList : false
      }
    })
  }
  if (tabId === 'login') {
    if (this.state.activeTab === 'login') {
      return
    }
    this.setState({
      channels: updateItemInCollection(this.state.channels, {id: this.state.activeTab, isCollapsed: true}),
      activeTab: tabId
    })
    return;
  }

  let updatedChannels
  if (this.state.activeTab !== 'login' && this.state.activeTab !== tabId) {
    updatedChannels = updateItemInCollection(this.state.channels, {id: this.state.activeTab, isCollapsed: true })
  } else {
    updatedChannels = this.state.channels
  }

  this.setState({
    activeTab: tabId,
    channels: updateItemInCollection(updatedChannels, {id: tabId, isCollapsed: false }),
    unreadChannels: _.assign({}, this.state.unreadChannels, {[tabId]: false})
  })

}

async function listenToUserChanges() {
  UserAPI.onAuthStateChanged(async user => {
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
        sessionProvider.set(configProvider.getConfig().appId, JSON.stringify({user: newUser}));
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
    }
  })
}

async function loginUser(userDetails) {
  this.newUserDetails = userDetails;
  const mainChannel = getMainChannel(this.state.channels);

  this.setState({
    channels: updateItemInCollection(this.state.channels, {id: mainChannel, isCollapsed: false }),
    activeTab: mainChannel,
    authState: AUTH_STATES.PENDING_LOGIN
  });

  return await UserAPI.login()
}

async function updateUser(user) {
  const updatedUser = await UserAPI.updateUser(user)
  sessionProvider.set(configProvider.getConfig().appId, JSON.stringify({user: updatedUser}));
  const mainChannel = getMainChannel(this.state.channels)
  this.setState({
    channels: updateItemInCollection(this.state.channels, {id: mainChannel, isCollapsed: false }),
    activeTab: mainChannel,
    currentUser: updatedUser
  });
}

async function toggleChannelWindowExpanded(channelId, removeChat) {
  const newState = {}
  if (removeChat) {
    await ChannelAPI.removeChannel(channelId);
    newState.channels =  _.filter(this.state.channels, channel => channel.id !== channelId);
    newState.activeTab = getMainChannel(newState.channels);
  } else {
    const isCollapsed = _.find(this.state.channels, {id: channelId}).isCollapsed;
    newState.channels = updateItemInCollection(this.state.channels, {id: channelId, isCollapsed: !isCollapsed })
  }
  this.setState(newState);
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      unreadChannels: {},
      activeTab: '',
      openTabs: {
        usersList: false
      },
      activeUsers: [],
      authState: AUTH_STATES.PRE_INIT,
      channels: [],
      appId: configProvider.getConfig().appId,
      uiProps: configProvider.getConfig().uiProps || {},
      currentUser: UserAPI.getDefaultUser()
    };
    const resetListeners = () => {
      listenToUserChanges.call(this);
      // listen to any changes in the channels list
      ChannelAPI.onPublicChannelsChanges(channelsDataRetrieved.bind(this));
      WidgetAPI.onWidgetChanges(widgetDataChanged.bind(this));
      listenToUsersChanges.call(this);
    }

    resetListeners()

    const self = this
    window.changeWidgetProps = uiProps => {
      self.setState({
        uiProps
      })
    }
    window.changeAppId = appId => {
      self.setState({
        activeTab: null,
        appId
      })
      resetListeners()
    }
  }

  componentDidMount() {
    ReportAPI.reportEvent('widget_view')
  }
  
  render() {
    return (
      <div dir="ltr" className={`App ${this.state.uiProps.theme || ''} ${this.state.uiProps.layout || ''}`}>
        <Chat user={this.state.currentUser}
              title = {this.state.uiProps.title}
              channels={this.state.channels}
              activeUsers={this.state.activeUsers}
              openTabs={this.state.openTabs}
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
