const functions = require('firebase-functions');
const app = require('express')();   // express app
const FBAuth = require('./util/fbAuth');

const { getAllScreams, postOneScream, getScream, commentOnScream } = require('./handlers/screams');
const { signUp, logIn, uploadImage, addUserDetails, getAuthenticatedUser } = require('./handlers/users');

// scream routes 
app.get('/screams', getAllScreams);
app.post('/scream',FBAuth, postOneScream);
app.get('/scream/:screamId',  getScream); // anonymous read allowed

// TODO: delete scream
// TODO: like a scream
// TODO: unlike a scream
// TODO: comment on scream
app.post('/scream/:screamId/comment', FBAuth, commentOnScream);

// Users routes
app.post('/signup', signUp)
app.post('/login', logIn)  // keep the login route minimal, only get the token
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);


// Post a scream. 
// express takes in also a middleware between a request and its response. 

// https://baseurl.com/api/...
exports.api = functions.https.onRequest(app);  // turn into multiple routes using express. 

/* session authentication (reference token): server keeps a session, client passes the session ID(always stored in a cookie) to the server. 
JWT token authentication (value token): all the information is kept by the client in the token itself in an encrypted way. server does not 
need to maintain all the client information any more (avoid conflict between multiple servers.)
*/ 