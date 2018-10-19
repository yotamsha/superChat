const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
const cors = require('cors')({origin: true});

exports.addTenant = functions.https.onRequest((request, response) => {
  functions.database.ref('/tenants')
  cors(request, response, () => {
    response.json({});
  });
});
