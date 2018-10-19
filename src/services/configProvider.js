import _ from 'lodash'
import config from './../config'

export default {
  getConfig: () => {
    return _.assign({}, config, window.chattersCfg_aoxie43dhjf456fkloia39)
  }
};
