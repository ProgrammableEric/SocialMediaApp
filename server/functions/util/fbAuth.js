const { admin } = require('./admin');

// middleware function 
// token starts from a Bearer [token]. Convention for putting token in the headers
module.exports = (req, res, next) => {
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        idToken = req.headers.authorization.split('Bearer ')[1];   // deconstruct the token
    } else {
        console.error('no token found');
        return res.status(403).json({ error: 'Unauthorized'});
    }

    admin.auth().verifyIdToken(idToken)
        .then(decodedToken => {   // decodede token holds the user data. 
            req.user = decodedToken;
            console.log('decoded Token:', decodedToken);
            return db.collection('users')  // go into database, match the user from uid in request token, to userId attribute in users colleciton. 
                .where('userId', '==', req.user.uid)
                .limit(1)
                .get();
        })
        .then(data => {
            req.user.handle = data.docs[0].data().handle;
            return next();
        })
        .catch(err => {
            console.error('Error while verifying token ', err);
            return res.status(403).json(err);
        })
}