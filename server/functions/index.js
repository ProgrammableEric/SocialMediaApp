const functions = require('firebase-functions');

var admin = require("firebase-admin");

var serviceAccount = require("/Users/ericfu/Documents/FrontEnd/Mock_Ins/smclone-3d5f9-firebase-adminsdk-d0t3x-e8f412aa49.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://smclone-3d5f9.firebaseio.com"
})

const firebaseConfig = {
    apiKey: "AIzaSyCzsON22DtlAwJlDECdeSvr-RQ1hQ3BPQg",
    authDomain: "smclone-3d5f9.firebaseapp.com",
    databaseURL: "https://smclone-3d5f9.firebaseio.com",
    projectId: "smclone-3d5f9",
    storageBucket: "smclone-3d5f9.appspot.com",
    messagingSenderId: "679302582202",
    appId: "1:679302582202:web:9b62c017c11d847d659783",
    measurementId: "G-6N5Q3CBPY0"
  };

const app = require('express')();   // express app

const firebase = require("firebase");   // firebase app for authentication 
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();   // to make things easier ... 

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

app.get('/screams', (req, res) => {
    db
    .collection("screams")
    .orderBy('createdAt', 'desc')
    .get()
    .then(
        data => {
            let screams = [];
            data.forEach (doc => {
                screams.push({
                    screamId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt,
                });
            })
            return res.json(screams);
        }
    ).catch(err => console.error(err));
})

app.post('/scream', ((req, res) => {
    // if (req.method !== 'POST'){
    //     return res.status(400).json({error: 'Method not allowed'});  // bad request, error 400
    // }  taken care by express
    
    const newScream = {
        body: req.body.body, 
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString(),
    };

    db
        .collection("screams")
        .add(newScream)
        .then((doc) => {
            res.json({message: `document ${doc.id} created successfully! `})
        })
        .catch(err => {
            res.status(500).json({ error: 'something went wrong'});  // server error, error 500. 
            console.error(err);
        })
}))


// Signup route 
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };

    // TODO: validate data
    db.doc('/users/${newUser.handle').get()
        .then(doc => {
            if (doc.exists){
                return res.status(400).json({ handle: 'this handle is already taken!'});
            } else {
                return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
            }
        }).then(data => {
            return data.user.getIdToken();
        }).then(token => {
            return res.status(201).json({ token }); 
        }).catch(err => {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                return res.status(400).json( {email: 'Email is already in use! '});
            } else {
                return res.status(500).json({ error: err.code });
            }
        })
})

// https://baseurl.com/api/...
exports.api = functions.https.onRequest(app);  // turn into multiple routes using express. 


