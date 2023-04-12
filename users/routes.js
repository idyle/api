import express from 'express';
import { generateHandler, verifyHandler, revokeHandler, getUserHandler } from "./handlers.js";
import { paramHandler, authHandler } from '../utilities/handlers.js';

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

const userHandler = paramHandler('all', userMatchesParams);

Router.use(jwtHandler);
Router.post('/generate', generateHandler);
Router.post('/verify', verifyHandler);
Router.post('/revoke', revokeHandler);
Router.use(authHandler);
Router.post('/user/:uid', [ converter, userHandler, getUserHandler ]);

export default Router;