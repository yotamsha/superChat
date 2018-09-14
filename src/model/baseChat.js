import _ from 'lodash';
import {mockChannels} from '../mocks'

class ChannelAPI {
    constructor() {
        this._channels = mockChannels
    }
    /**
     *
     * @param parentChannel the parent channel to create a sub channel for. If not provided, will generate a root channel.
     * @param userIds
     * @returns {Promise<Channel>} id of the new created channel
     */
    async createChannel(parentChannel, userIds) {
        const channelId = _.unique('channel_')
        const newChannel = {
            title: 'New Channel',
            id: channelId,
            users: userIds,
            parentChannel
        };
        this._channels[channelId] = newChannel;
        return newChannel;
    }

    /**
     * remove channel and all it's messages.
     * @param channelId
     */
    async removeChannel(channelId) {

    }

    /**
     * Add user to channel
     * @param channelId
     * @param userId
     */
    async addUserToChannel(channelId, userId) {

    }

    /**
     * Add message to channel
     * @param channelId
     * @param messageId
     */
    async addMessageToChannel(channelId, messageId) {

    }

    /**
     * Get all channels for a given userId
     * @param channelId
     * @param userId
     */
    async getChannelsByUserId(userId) {
        return [this._channels[0], this._channels[1]]
    }
}
/**
 * This class will initiate the SuperChat service.
 *
 * API:
 * - get a real-time list of messages for a given clientId.
 * - create a new channel with the given userIds
 * -
 */
class BaseChat {
    constructor() {
        this.clientId = '1234'
        this.channelAPI = new ChannelAPI();
    }

    async listenOnChannel(channelId) {
        return this.chatAPI.listenOnChannel(channelId)
    }



    async createMessage(channelId, text) {

    }

}

export default BaseChat;