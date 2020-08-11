const functions = require('firebase-functions');
const app = require('express')();   // express app
const FBAuth = require('./util/fbAuth');
const { db } = require('./util/admin');

const { 
    getAllScreams, 
    postOneScream, 
    getScream, 
    commentOnScream,
    likeScream,
    unlikeScream,
    deleteScream
 } = require('./handlers/screams');

const { 
    signUp, 
    logIn, 
    uploadImage, 
    addUserDetails, 
    getAuthenticatedUser,
    getUserDetails,
    markNotificationsRead
} = require('./handlers/users');

// scream routes 
app.get('/screams', getAllScreams);
app.post('/scream',FBAuth, postOneScream);
app.get('/scream/:screamId',  getScream); // anonymous read allowed
app.delete('/scream/:screamId', FBAuth, deleteScream);
app.get('/scream/:screamId/like', FBAuth, likeScream);
app.get('/scream/:screamId/unlike', FBAuth, unlikeScream);
app.post('/scream/:screamId/comment', FBAuth, commentOnScream);

// Users routes
app.post('/signup', signUp)
app.post('/login', logIn)  // keep the login route minimal, only get the token
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);
app.get('/user/:handle', getUserDetails);
app.post('/notifications', FBAuth, markNotificationsRead);


// https://baseurl.com/api/...
exports.api = functions.https.onRequest(app);  // turn into multiple routes using express. 

/* 

Session authentication (reference token): server keeps a session, client passes the session ID(always stored in a cookie) to the server. 

WT token authentication (value token): all the information is kept by the client in the token itself in an encrypted way. server does not 
need to maintain all the client information any more (avoid conflict between multiple servers.)

*/ 

// Firestore event trigger to generate notifications. 
// create a like notification
exports.createNotificationOnLike = 
    functions.region('australia-southeast1')
    .firestore.document('likes/{id}')
    .onCreate(( snapshot ) => {
        return db
            .doc(`/screams/${snapshot.data().screamId}`)
            .get()
            .then(doc => {
                if(doc.exists){
                    console.log("should be right.");
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle,
                        sender: snapshot.data().userHandle,
                        type: 'like',
                        read: false,
                        screamId: doc.id
                    });
                } else {
                    console.log("should not enter here.");
                }
            })
            .then(() => {
                return;
            })
            .catch(err => {
                console.error(err);
                return; 
            })
    })


exports.deleteNotificationOnUnlike = 
    functions.region('australia-southeast1')
    .firestore.document('likes/{id}')
    .onDelete((snapshot) => {
        return db.doc(`notifications/${snapshot.id}`)
            .delete()
            .then(() => {
                return;
            })
            .catch(err => {
                console.error(err);
                return; 
            })
    })


exports.createNotificationOnComment = 
    functions.region('australia-southeast1').
    firestore.document('comments/{id}')
    .onCreate((snapshot) => {
        return db.doc(`/screams/${snapshot.data().screamId}`)
            .get()
            .then(doc => {
                if(doc.exists){
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle,
                        sender: snapshot.data().userHandle,
                        type: 'comment',
                        read: false,
                        screamId: doc.id
                    });
                }
            })
            .then(() => {
                return;
            })
            .catch(err => {
                console.error(err);
                return; 
            })
    })