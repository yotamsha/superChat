import _ from 'lodash';
import {mockChannels, mockUsers} from '../mocks'

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
        const channelId = _.uniqueId('channel_')
        const newChannel = await {
            title: 'New Channel',
            id: channelId,
            messages: [],
            users: [_.find(mockUsers, {id: userIds[0]})],
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
    async addMessageToChannel(channelId, message) {
        const channel = _.find(this._channels, {id: channelId});
        channel.messages = _.concat(channel.messages, {id: _.uniqueId('msg_'), text: message, user: mockUsers[0]});
        return await channel;
    }

    /**
     * Get all channels for a given userId
     * @param channelId
     * @param userId
     */
    async getChannelsByUserId(userId) {
        return [this._channels[0], this._channels[1]];
    }
}

export default ChannelAPI;