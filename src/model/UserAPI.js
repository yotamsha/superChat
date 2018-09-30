import {store} from '../store/index'
import sessionProvider from "../services/sessionProvider";
import config from '../config'
const collectionId = 'users'
const tenantId = config.defaultTenantId;

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

  validateSession: storedUser => {
    if (storedUser) {
      const sessionUser = getSessionUser();
      if (!sessionUser || storedUser.uid !== sessionUser.id) {
        // user is authenticated with a different tenant.
        console.log('logging out invalid user.');
        store.logout();
      }
    }
  },

  getDefaultUser: () => {
    const randomId = Math.floor(Math.random() * (10000));
    return {
      username: `Guest${randomId}`
    };
  },

  getCurrentUser: () => {
    const sessionUser = sessionProvider.has(tenantId) && JSON.parse(sessionProvider.get(tenantId)).user;
    return sessionUser || UserAPI.getDefaultUser();
  },

  createUser: user => {
    store.createDocument(tenantId, collectionId, user);
  }
};

export default UserAPI;