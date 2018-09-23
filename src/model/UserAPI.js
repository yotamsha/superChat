import {store} from '../store/index'

//const collectionName = 'users'

export default {
  login: async () => {
    return store.login();
  },

  onAuthStateChanged: (cb) => {
      store.onAuthStateChanged(cb);
  },

  getDefaultUser: () => {
      const randomId = Math.floor(Math.random() * (10000));
      return {
          username: `Guest${randomId}`
      };
  }

}