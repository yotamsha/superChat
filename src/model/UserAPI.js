import {store} from '../store/index'
import sessionProvider from "../services/sessionProvider";
import configProvider from '../services/configProvider'
const collectionId = 'users'
const tenantId = configProvider.getConfig().appId;

function getSessionUser() {
    return sessionProvider.has(tenantId) && JSON.parse(sessionProvider.get(tenantId)).user;
}

const UserAPI = {
    login: async() => {
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
        const randomId = Math.floor(Math.random() * (10000));
        return {
            username: `Guest${randomId}`
        };
    },

    getCurrentUser: () => {
        //const sessionUser = sessionProvider.has(tenantId) && JSON.parse(sessionProvider.get(tenantId)).user;
        return UserAPI.getDefaultUser();
    },

    createUser: user => {
        store.createDocument(tenantId, collectionId, user);
    }
};

export default UserAPI;