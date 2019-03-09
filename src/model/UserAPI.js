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
      if (storedUser && storedUser.uid) {
        UserAPI.updateUser({id: storedUser.uid, lastVisit: new Date().getTime()})
      }
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
    const DAYS_SINCE_ACTIVE = 3;
    const dateOffset = (24*60*60*1000) * DAYS_SINCE_ACTIVE; //3 days
    const d = new Date();
    d.setTime(d.getTime() - dateOffset);

    const filters = [{
      field: 'lastVisit',
      condition: '>=',
      value: d.getTime(),
    }]
    store.onCollectionChanges(getTenantId(), 'users', filters, cb)
  },
};

export default UserAPI;