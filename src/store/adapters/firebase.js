import firebase from 'firebase'
import {store} from "../index";

var config = {
  apiKey: "AIzaSyA7Tzt7Whc6uY9YCBeiCrIgUm9r3qXFEMU",
  authDomain: "superchat-e7dbf.firebaseapp.com",
  databaseURL: "https://superchat-e7dbf.firebaseio.com",
  projectId: "superchat-e7dbf",
  storageBucket: "superchat-e7dbf.appspot.com",
  messagingSenderId: "933253543537"
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


//
// firebase.auth().onAuthStateChanged(function(user) {
//   if (user) {
//     // User is signed in.
//     var isAnonymous = user.isAnonymous;
//     var uid = user.uid;
//     // ...
//     console.log('user logged: ' + uid)
//   } else {
//     // User is signed out.
//     // ...
//   }
//   // ...
// });

// Get a reference to the database service
//db.collection("users").get()

const tenantsCollection = 'tenants';

const dbActions = {
  getById: (collectionId, id) => {
    return db.ref(`${collectionId}/${id}`).once('value').then(function(snapshot) {
      return snapshot.val();
    });
  },

  getAll: (collectionId) => {
    return db.collection(collectionId).get().then(function(snapshot) {
      return snapshotCollectionToArray(snapshot)
      return snapshot;
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

  onCollectionChanges: (tenantId, collectionId, cb) => {
    db.collection(tenantsCollection).doc(tenantId).collection(collectionId).onSnapshot(snapshot => {
      cb(snapshotCollectionToArray(snapshot), snapshot.docChanges());
    });
  },

  createDocument: (tenantId, collectionName, newInstance) => {
    var collectionRed = db.collection(tenantsCollection).doc(tenantId).collection(collectionName);
    collectionRed.add(newInstance);
  },

  createRelated: (tenantId, collectionName, docId, relatedCollection, newInstance) => {
    var relatedRef = db.collection(tenantsCollection).doc(tenantId).collection(collectionName).doc(docId).collection(relatedCollection);
    relatedRef.add(newInstance);
  },

  login: async () => {
    return firebase.auth().signInAnonymously()
  },

  onAuthStateChanged: (cb) => {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        let isAnonymous = user.isAnonymous;
        let uid = user.uid;
        cb(user);
      } else {
        // User is signed out.
        cb(null)
      }
    });
  }

};

export default dbActions;