import {store} from '../store/index';
import configProvider from '../services/configProvider'

const getTenantId = () => configProvider.getConfig().appId


export default {
    onWidgetChanges(cb) {
      store.onDocumentChanges(getTenantId(),null, null, cb);
    }
}