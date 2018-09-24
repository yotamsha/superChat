import {store} from '../store/index'
import React from "react";
import sessionProvider from "../services/sessionProvider";

//const collectionName = 'users'

export default {
  login: async () => {
    return store.login();
  },

  onAuthStateChanged: (cb) => {
    // TODO add user to users collection if it doesn't exist.
    store.onAuthStateChanged(cb);
  },

  getDefaultUser: () => {
    const randomId = Math.floor(Math.random() * (10000));
    return {
      username: `Guest${randomId}`
    };
  },

  getCurrentUser: () => {
    const sessionUser = sessionProvider.has('user') && JSON.parse(sessionProvider.get('user'))
    return sessionUser || this.getDefaultUser()
  }

}