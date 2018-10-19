import {store} from '../store/index'
import sessionProvider from "../services/sessionProvider";
import configProvider from '../services/configProvider'

const collectionId = 'users'
const tenantId = configProvider.getConfig().appId;

function getSessionUser() {
  return sessionProvider.has(tenantId) && JSON.parse(sessionProvider.get(tenantId)).user;
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
    store.createDocument(tenantId, collectionId, user);
  },

  updateUser: user => {
    return store.updateDocument(tenantId, collectionId, user);
  }
};

export default UserAPI;