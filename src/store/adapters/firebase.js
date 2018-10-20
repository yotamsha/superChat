import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

import config from './../../config'
import _ from "lodash";

var firebaseConfig = config.storeAdapters.firebase;
firebase.initializeApp(firebaseConfig);
// Initialize Cloud Firestore through Firebase
var db = firebase.firestore();

// Disable deprecated features
db.settings({
  timestampsInSnapshots: true
});

function snapshotCollectionToArray(snapshot) {
  const data = [];
  snapshot.forEach((doc) => {
    data.push(Object.assign({id: doc.id}, doc.data()))
  });
  return data;
}

function snapshotDocumentToArray(doc) {
  return Object.assign({id: doc.id}, doc.data());
}

const tenantsCollection = 'tenants';

const dbActions = {
  getById: (collectionId, id) => {
    return db.ref(`${collectionId}/${id}`).once('value').then(function (snapshot) {
      return snapshot.val();
    });
  },

  getAll: (collectionId) => {
    return db.collection(collectionId).get().then(function (snapshot) {
      return snapshotCollectionToArray(snapshot)
    });
  },

  onDocumentChanges: (tenantId, collectionId, docId, cb) => {
    db.collection(tenantsCollection).doc(tenantId).collection(collectionId).doc(docId).onSnapshot(snapshot => {
      cb(snapshotDocumentToArray(snapshot));
    });
  },

  onDocumentRelatedChanges: (tenantId, collectionId, docId, relatedCollectionId, cb) => {
    db.collection(tenantsCollection).doc(tenantId).collection(collectionId).doc(docId).collection(relatedCollectionId).onSnapshot(snapshot => {
      cb(snapshotCollectionToArray(snapshot));
    });
  },

  onCollectionChanges: (tenantId, collectionId, filters, cb) => {
    let collectionRef = db.collection(tenantsCollection).doc(tenantId).collection(collectionId);
    filters.forEach(filter => {
      collectionRef = collectionRef.where(filter.field, filter.condition, filter.value);
    });

    collectionRef.onSnapshot(snapshot => {
      cb(snapshotCollectionToArray(snapshot), snapshot.docChanges());
    });
  },

  createDocument: (tenantId, collectionName, newInstance) => {
    let collectionRef = db.collection(tenantsCollection).doc(tenantId).collection(collectionName);
    if (newInstance.id) {
      collectionRef = collectionRef.doc(newInstance.id)
      return collectionRef.set(_.omit(newInstance, 'id'));
    } else {
      return collectionRef.add(newInstance);
    }
  },

  updateDocument: async (tenantId, collectionName, instance) => {
    let docRef = db.collection(tenantsCollection).doc(tenantId).collection(collectionName).doc(instance.id);
    await docRef.set(instance, {merge: true});
    return instance;
  },

  createRelated: (tenantId, collectionName, docId, relatedCollection, newInstance) => {
    const relatedRef = db.collection(tenantsCollection).doc(tenantId).collection(collectionName).doc(docId).collection(relatedCollection);
    relatedRef.add(newInstance);
  },

  populateFromCollection: async (tenantId, collectionId, ids = []) => {
    const collectionRef = db.collection(tenantsCollection).doc(tenantId).collection(collectionId);

    let results = [];
    try {
      results = (await Promise.all(ids.map(id => collectionRef.doc(id).get())))
        .filter(doc => doc.exists)
        .map(doc =>  _.defaults({id: doc.id, }, doc.data()));

    } catch (error) {
      console.error(`received an error in populateFromCollection method for collection ${collectionId}:`, error);
      return results;

    }

    return results;
  },

  login: async () => {
    return firebase.auth().signInAnonymously()
  },

  logout: async () => {
    return firebase.auth().signOut()
  },

  signInWithCustomToken:  async token => {
    return firebase.auth().signInWithCustomToken(token)
  },

  onAuthStateChanged: (cb) => {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        // User is signed in.
        cb(user);
      } else {
        // User is signed out.
        cb(null)
      }
    });
  },

  removeDocument: (tenantId, collectionId, docId) => {
    let docRef = db.collection(tenantsCollection).doc(tenantId).collection(collectionId).doc(docId);
    return docRef.delete();
  }

};

export default dbActions;