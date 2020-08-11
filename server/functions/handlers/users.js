const {admin, db} = require('../util/admin');
const config = require('../util/config');

const firebase = require('firebase');
firebase.initializeApp(config);

const { validateSignupData, validateLoginData, reduceUserDetails } = require('../util/validators');

// sign user in
exports.signUp = (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };

    const { valid, errors } = validateSignupData(newUser);

    if (!valid) return res.status(400).json(errors);

    const noImg = 'no-image.png';

    let token, userId; 
    db.doc(`/users/${newUser.handle}`)
        .get()   // promise let you write asynchronous methods in a synchronous way.
        .then(doc => {
            if (doc.exists){
                return res.status(400).json({ handle: 'this handle is already taken!'});
            } else {
                return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
            }
        }).then(data => {
            userId = data.user.uid;
            return data.user.getIdToken();
        }).then(idToken => {
            token = idToken;  
            const userCredentials = {
                handle: newUser.handle,
                email: newUser.email,
                createdAt: new Date().toISOString(),
                imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
                userId
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        }).then(() => {
            return res.status(201).json( { token } );  // status 201, created 
        }).catch(err => {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                return res.status(400).json( {email: 'Email is already in use! '});
            } else {
                return res.status(500).json({ error: err.code });
            }
        })
}

// log user in
exports.logIn = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password,
    }

    const { valid, errors } = validateLoginData(user);

    if (!valid) return res.status(400).json(errors);

    firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            return res.json({token});
        })
        .catch(err => {
            console.error(err);
            if (err.code === 'auth/wrong-password') 
                return res.status(403).json({ general: 'Wrong credentials, please try again'})
            else 
                return res.status(500).json({error: err.code});
        })
}

// add user details
exports.addUserDetails = (req, res) => {
    let userDetails = reduceUserDetails(req.body);

    // db.doc('xxx').set(), .get(), update() - update: if no such key, create new, if so, update
    db.doc(`/users/${req.user.handle}`).update(userDetails)
        .then(() => {
            return res.json({ message: 'Details added succesfully!'});
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({error: err.code});
        })    
}

//get own user details (to show at my own page)
exports.getAuthenticatedUser = (req, res) => {
    let userData = {};
    db.doc(`/users/${req.user.handle}`).get()
        .then(doc => {
            if(doc.exists) {
                userData.credentials = doc.data();
                return db.collection('likes').where('userHandle', '==', req.user.handle).get();
            }
            // doc reference return empty object if no such do exists. 
        })
        .then(data => {
            userData.likes = [];
            data.forEach(doc => {
                userData.likes.push(doc.data());
            });
            return db.collection(`notifications`).where('recipient', '==', req.user.handle)
                .orderBy('createdAt', 'desc').limit(10).get();
        })
        .then(data => {
            userData.notifications = [];
            data.forEach(doc => {
                userData.notifications.push({
                    recipient: doc.data().recipient,
                    sender: doc.data().sender,
                    createdAt: doc.data().createdAt,
                    screamId: doc.data().screamId,
                    type: doc.data().type,
                    read: doc.data().read,
                    NotificationId: doc.id
                })
            });
            return res.json(userData);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code});
        })
}

//Get any user's details (to show as other people's page )
exports.getUserDetails = (req, res) => {
    let userData = {};
    db.doc(`/users/${req.params.handle}`).get()
        .then(doc => {
            if (doc.exists){
                userData.user = doc.data();
                return db
                    .collection('screams')
                    .where('userHandle', '==', req.params.handle)
                    .orderBy('createdAt', 'desc')
                    .get();
            } else {
                return res.status(404).json({ error: 'User not found'});
            }
        })
        .then(data => {
            userData.screams = [];
            data.forEach(doc => {
                userData.screams.push({
                    body: doc.data().body,
                    createdAt: doc.data().createdAt,
                    userImage: doc.data().userImage,
                    likeCount: doc.data().likeCount,
                    commentCount: doc.data().commentCount,
                    screamId: doc.id
                })
            });
            return res.json(userData);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        })
}

// upload a profile image for user
exports.uploadImage = (req, res) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');  // file system 

    const busboy = new BusBoy({ headers: req.headers });
    
    let imageFileName;
    let imageToBeUploaded = {};

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        console.log(fieldname);
        console.log(filename);
        console.log(mimetype);

        if(mimetype !== 'image/jpeg' && mimetype !== 'image/png'){
            return res.status(400).json({ error: 'wrong file type submitted' }); 
        }

        // image.png 
        const imageExtension = filename.split('.')[filename.split('.').length - 1];
        imageFileName = `${Math.round(Math.random()*10000000000)}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFileName);
        imageToBeUploaded = { filepath, mimetype };
        file.pipe(fs.createWriteStream(filepath));   // create the file
    }); 

    busboy.on('finish', () => {
        // save image url to the firebase storage. 
        admin.storage().bucket('gs://smclone-3d5f9.appspot.com').upload(imageToBeUploaded.filepath, {
            resumable: false,
            metadata: {
                metadata: {
                    contentType: imageToBeUploaded.mimetype
                }
            }
        })
        .then(() => {
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
            return db.doc(`/users/${req.user.handle}`).update({ imageUrl });  // update user information. 
            
        })
        .then(() => {
            return res.json({message: 'Image uploaded successfully!'});
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        })
    })
    busboy.end(req.rawBody);
}

// slice(): returns a shallow copy of the portion of the array, without changing the original.  
// splice(): remove or replace parts of the original array.

exports.markNotificationsRead = (req, res) => {
    let batch = db.batch();
    req.body.forEach(notificationId => {
        const notification = db.doc(`/notifications/${notificationId}`);
        batch.update(notification, {read: true});
    });
    batch.commit()
        .then(() => {
            return res.json({message: 'Notifications marked read'});
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err.code });
        })
}

