import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import _ from "lodash";

var config = {
  apiKey: "AIzaSyA7Tzt7Whc6uY9YCBeiCrIgUm9r3qXFEMU",
  //authDomain: "superchat-e7dbf.firebaseapp.com",
  //databaseURL: "https://superchat-e7dbf.firebaseio.com",
  projectId: "superchat-e7dbf",
  //storageBucket: "superchat-e7dbf.appspot.com",
  //messagingSenderId: "933253543537"
};
firebase.initializeApp(config);
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
      collectionRef.set(_.omit(newInstance, 'id'));
    } else {
      collectionRef.add(newInstance);
    }
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

  onAuthStateChanged: (cb) => {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in.
        cb(user);
      } else {
        // User is signed out.
        cb(null)
      }
    });
  }

};

export default dbActions;