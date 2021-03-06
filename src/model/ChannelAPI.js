import _ from 'lodash';
import {store} from '../store/index';
import configProvider from '../services/configProvider'

const collectionName = 'channels';
const getTenantId = () => configProvider.getConfig().appId
async function populatedListWithRelatedCollection(list, fieldToPopulate, populateFromCollection,) {
  return (await Promise.all(list.map(async item => {
    const members = await store.populateFromCollection(getTenantId(), populateFromCollection, item[fieldToPopulate]);
    return _.assign({}, item, {members})
  })));
}

export default {
    async getAll() {
      return store.getAll(collectionName);
    },

    onChannelChanges(channelId, cb) {
      store.onDocumentChanges(getTenantId(), collectionName, channelId, cb);
    },

    onChannelMessagesChanges(channelId, cb) {
      store.onDocumentRelatedChanges(getTenantId(), collectionName, channelId, 'messages', cb);
    },

    async onPublicChannelsChanges(cb) {
       const filters = [{
          field: 'isPublic',
          condition: '==',
          value: true,
        }]
        store.onCollectionChanges(getTenantId(), collectionName, filters, async (results) => {
          let populatedResults = await populatedListWithRelatedCollection(results, 'members', 'users');
          cb(populatedResults);
        });
    },

    onPrivateChannelsChanges(userId, cb) {
      const filters = [{
        field: 'members',
        condition: 'array-contains',
        value: userId,
      }];
      store.onCollectionChanges(getTenantId(), collectionName, filters, async (results) => {
        let populatedResults = await populatedListWithRelatedCollection(results, 'members', 'users');
        cb(populatedResults);
      });
    },
    /**
     *
     * @param parentChannel the parent channel to create a sub channel for. If not provided, will generate a root channel.
     * @param userIds
     * @returns {Promise<Channel>} id of the new created channel
     */
    async createChannel(usersToAdd) {
        // const channelTitle = `#${getUID()}`;
        const newChannel = {
            createdAt: new Date().getTime(),
            members: usersToAdd,
            isPublic: false
        };
        return store.createDocument(getTenantId(), collectionName, newChannel);
    },
    /**
     * remove channel and all it's messages.
     * @param channelId
     */
    removeChannel(channelId) {
      return store.removeDocument(getTenantId(), collectionName, channelId);
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
        return await store.createRelated(getTenantId(), collectionName, channelId, 'messages', {
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