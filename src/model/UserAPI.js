import {store} from '../store/index'
import sessionProvider from "../services/sessionProvider";
import configProvider from '../services/configProvider'

const collectionId = 'users'
const getTenantId = () => configProvider.getConfig().appId

function getSessionUser() {
  return sessionProvider.has(getTenantId()) && JSON.parse(sessionProvider.get(getTenantId())).user;
}

const UserAPI = {
  login: async () => {
    return store.login();
  },

  onAuthStateChanged: (cb) => {
    // TODO add user to users collection if it doesn't exist.
    store.onAuthStateChanged(storedUser => {
      cb(storedUser)
    });
  },

  validateSession: storedUserId => {
    const sessionUser = getSessionUser();
    if (!sessionUser || storedUserId !== sessionUser.id) {
      store.logout();
      return false;
    }
    return true;
  },

  getDefaultUser: () => {
    return {
      username: ''
    };
  },

  getCurrentUser: () => {
    return getSessionUser();
  },

  createUser: user => {
    store.createDocument(getTenantId(), collectionId, user);
  },

  updateUser: user => {
    return store.updateDocument(getTenantId(), collectionId, user);
  },

  onUsersChanges(cb) {
    store.onCollectionChanges(getTenantId(), 'users', [], cb)
  },
};

export default UserAPI;