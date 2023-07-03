import express from 'express';
import { generateHandler, verifyHandler, revokeHandler, getUserHandler, setUserHandler } from "./handlers.js";
import { paramHandler, authHandler, reqHandler } from '../utilities/handlers.js';

const Router = express.Router();

const jwtExists = {
    firstArg: { from: { from: 'req', find: 'headers' }, find: 'authorization' },
    existence: true,
    message: 'The authorization field is not specified.'
};

const jwtHandler = paramHandler('all', jwtExists);

const converter = paramHandler(
    'optional',
    {
        firstArg: { from: { from: 'req', find: 'params' }, find: 'uid' },
        secondArg: 'user',
        equality: true,
        assign: { from: { from: 'res', find: 'user' }, find: 'uid' } 
    }
);

const userMatchesParams = {
    firstArg: { from: { from: 'req', find: 'params'}, find: 'uid' },
    secondArg: { from: { from: 'res', find: 'user' }, find: 'uid' },
    equality: true,
    message: 'This request does not match this user.'
};

const userIsAdmin = {
    firstArg: { from: { from: 'res', find: 'user'}, find: 'admin' },
    secondArg: true,
    equality: true,
    message: 'This user is not an admin.'
};

const userHandler = paramHandler('any', userMatchesParams, userIsAdmin);

const userClaimsExists = {
    firstArg: { from: { from: 'req', find: 'body' }, find: 'claims' },
    existence: true,
    message: 'There are no claims included in the request.'
};

const claimsHandler = paramHandler('all', userClaimsExists);

Router.use(jwtHandler);
Router.route('/tokens')
.get(verifyHandler)
.post(generateHandler)
.delete(revokeHandler);
Router.use(authHandler);
Router.use(reqHandler);
Router.route('/users/:uid')
.get([ converter, userHandler, getUserHandler ])
.post([ converter, claimsHandler, userHandler, setUserHandler ]);

export default Router;