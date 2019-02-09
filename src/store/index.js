import getStore from './adapters/firebase';

const tenantsStore = getStore()
const baseStore = getStore('stats')
export {
  tenantsStore as store,
  baseStore
}