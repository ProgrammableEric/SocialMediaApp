var admin = require("firebase-admin");  // used for operating firebase

// var serviceAccount = require("/Users/ericfu/Documents/FrontEnd/Mock_Ins/serviceKey/smclone-3d5f9-firebase-adminsdk-d0t3x-e8f412aa49.json");

admin.initializeApp();

const db = admin.firestore(); // Refers to firebase database, to make things easier ... 

module.exports = { admin, db };
