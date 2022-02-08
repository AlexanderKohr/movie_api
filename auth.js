// has to be the same key used in the JWTStrategy in passport file
const jwtSecret = 'your_jwt_secret';

const { Router } = require('express');
const jwt = require('jsonwebtoken'),
    passport = require('passport');

// requires the local passport file
require('./passport');

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        // this is the username that is encoded in the JWT
        subject: user.Username,
        // this specifies that the token will expire in 7 days
        expiresIn: '7d',
        // this is the algorithm used to sign oder encode the values of the JWT
        algorithm: 'HS256'
    });
}

module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', { sessions: false}, (error, user, info) => {
            if (error || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    user: user
                });
            }
            req.login(user, { session: false }, (error) => {
                if (error) {
                    res.send(error);
                }
                let token = generateJWTToken(user.toJSON());
                return res.json({ user, token });
            });
        })(req, res);
    });
}

