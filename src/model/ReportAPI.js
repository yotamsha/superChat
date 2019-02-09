import {baseStore as store} from '../store/index'
import configProvider from '../services/configProvider'

const tenantId = configProvider.getConfig().appId;

const ReportAPI = {
  async reportEvent(eventName) {

    return store.createDocument(eventName, 'events', {
      createdAt: new Date().getTime(),
      url: window.location.href,
      tenantId
    });
  }
  // async createChannel(usersToAdd) {
  //   // const channelTitle = `#${getUID()}`;
  //   const newChannel = {
  //     createdAt: new Date().getTime(),
  //     members: usersToAdd,
  //     isPublic: false
  //   };
  //   return store.createDocument(tenantId, collectionName, newChannel);
  // },
};

export default ReportAPI;