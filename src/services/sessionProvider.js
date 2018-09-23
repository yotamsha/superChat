export default {
  set: (key, value) => {
    return window.localStorage.setItem(key, value);
  },

  get: key => {
    return window.localStorage.getItem(key);
  },

  has: key => {
    return !!window.localStorage.getItem(key);
  },

  remove: key => {
    return window.localStorage.removeItem(key);
  }
};