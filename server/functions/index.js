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
                if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle){
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
            .catch(err => {
                console.error(err);
            })
    })


exports.deleteNotificationOnUnlike = 
    functions.region('australia-southeast1')
    .firestore.document('likes/{id}')
    .onDelete((snapshot) => {
        return db.doc(`notifications/${snapshot.id}`)
            .delete()
            .catch(err => {
                console.error(err);
            })
    })


exports.createNotificationOnComment = 
    functions.region('australia-southeast1').
    firestore.document('comments/{id}')
    .onCreate((snapshot) => {
        return db.doc(`/screams/${snapshot.data().screamId}`)
            .get()
            .then(doc => {
                if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle){
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
            .catch(err => {
                console.error(err);
            })
    })

// update user image url for all screams the user has changed it. 
exports.onUserImageChange = functions.region('australia-southeast1').firestore.document('/users/{userId}')
    .onUpdate(change => {
        console.log(change.before.data());
        console.log(change.after.data());
        if (change.before.data().imageUrl !== change.after.data().imageUrl){
            console.log('image has changed');
            const batch = db.batch();
            return db.collection('screams').where('userHandle', '==', change.before.data().handle).get()
            .then(data => {
                data.forEach(doc => {
                    const scream = db.doc(`/screams/${doc.id}`);
                    batch.update(scream, {userImage: change.after.data().imageUrl});
                })
                return batch.commit();
            })
        }
    })


// delete likes, comments from the database if the corresponding scream is deleted. 
exports.onScreamDelete = functions.region('australia-southeast1').firestore.document('/scream/{screamId}')
    .onDelete( (snapshot, context) => {  // context contains the url parameters. 
        const screamId = context.params.screamId;
        const batch = db.batch();
        return db.collection('comments').where('screamId', '==', screamId).get()
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/comments/${doc.id}`));
                })
                return db.collection('likes').where('screamId', '==', screamId);
            })
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/likes/${doc.id}`));
                })
                return db.collection('notifications').where('screamId', '==', screamId);
            })
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/notifications/${doc.id}`));
                })
                return batch.commit();
            })
            .catch(err => {
                console.error(err);
            })
    })