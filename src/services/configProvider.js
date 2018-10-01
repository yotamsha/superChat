import _ from 'lodash'
import config from './../config'
import urlUtils from './../utils/urlUtils'

export default {
   getConfig: () => {
       return _.assign({}, config, urlUtils.queryStringToJSON(window.location.search))
   }
};
