import _ from 'lodash';
import {mockUsers} from '../mocks';
import {store} from '../store/index';

const collectionName = 'channels';
const tenantId = 'FANLZucFAQUK6H9caIKC';
function getUID() {
  return Math.floor(Math.random() * 100000000);
}

export default {
    async getAll() {
      return store.getAll(collectionName);
    },

    onChannelChanges(channelId, cb) {
      store.onDocumentChanges(tenantId, collectionName, channelId, cb);
    },

    onChannelMessagesChanges(channelId, cb) {
      store.onDocumentRelatedChanges(tenantId, collectionName, channelId, 'messages', cb);
    },

    onChanges(cb) {
        store.onCollectionChanges(tenantId, collectionName, cb);
    },
    /**
     *
     * @param parentChannel the parent channel to create a sub channel for. If not provided, will generate a root channel.
     * @param userIds
     * @returns {Promise<Channel>} id of the new created channel
     */
    async createChannel(parentChannel, usersToAdd) {
        const channelTitle = `#${getUID()}`;
        const newChannel = await {
            title: channelTitle,
            createdAt: new Date().getTime(),
            users: usersToAdd,
            parentChannel
        };
        return store.createDocument(tenantId, collectionName, newChannel);
    },

    /**
     * remove channel and all it's messages.
     * @param channelId
     */
    async removeChannel(channelId) {

    },

    /**
     * Add user to channel
     * @param channelId
     * @param userId
     */
    async addUserToChannel(channelId, userId) {

    },

    /**
     * Add message to channel
     * @param channelId
     * @param messageId
     */
    async addMessageToChannel(channelId, message, user) {
        return await store.createRelated(tenantId, collectionName, channelId, 'messages', {
            text: message,
            createdAt: new Date().getTime(),
            user
        });
    },

    /**
     * Get all channels for a given userId
     * @param channelId
     * @param userId
     */
    async getChannelsByUserId(userId) {
        //return [this._channels[0], this._channels[1]];
    }
}