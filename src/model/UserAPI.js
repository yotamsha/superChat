import _ from 'lodash';
import {mockUsers} from '../mocks'
import {store} from '../store/index'

const collectionName = 'users'

export default {
  login: async () => {
    return store.login();
  },

  onAuthStateChanged: (cb) => {
      store.onAuthStateChanged(cb);
  }

}