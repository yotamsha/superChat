import _ from 'lodash';
import {mockUsers} from '../mocks'
import {store} from '../store/index'

const collectionName = 'channels'

export default {
    async getAll() {
      return store.getAll(collectionName);
    },

    onChannelChanges(channelId, cb) {
      store.onDocumentChanges(collectionName, channelId, cb);
    },

    onChannelMessagesChanges(channelId, cb) {
      store.onDocumentRelatedChanges(collectionName, channelId, 'messages', cb);
    },

    onChanges(cb) {
        store.onCollectionChanges(collectionName, cb);
    },
    /**
     *
     * @param parentChannel the parent channel to create a sub channel for. If not provided, will generate a root channel.
     * @param userIds
     * @returns {Promise<Channel>} id of the new created channel
     */
    async createChannel(parentChannel, userIds) {
        const newChannel = await {
            title: 'New Channel',
            users: [_.find(mockUsers, {id: userIds[0]})],
            parentChannel
        };
        return store.createDocument(collectionName, newChannel);
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
    async addMessageToChannel(channelId, message, userId) {
        const user = _.find(mockUsers, {id: userId})
        return await store.createRelated(collectionName, channelId, 'messages', {
            text: message,
            createdAt: new Date(),
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