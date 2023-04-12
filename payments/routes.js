import express from 'express';
import { authHandler, paramHandler } from '../utilities/handlers.js';
import { cancelHandler, checkoutHandler, confirmHandler } from './handlers.js';

const Router = express.Router();

const jwtExists = {
    firstArg: { from: { from: 'req', find: 'headers' }, find: 'authorization' },
    existence: true,
    message: 'The authorization field is not specified.'
};

const jwtHandler = paramHandler('all', jwtExists);

const subscriptionDoesNotExist = {
    firstArg: { from: { from: 'res', find: 'user'}, find: 'planType' },
    secondArg: undefined,
    equality: true,
    message: 'This user has a subscription.'
};

const noSubHandler = paramHandler('all', subscriptionDoesNotExist);

const subscriptionExists = {
    firstArg: { from: { from: 'res', find: 'user'}, find: 'planType' },
    existence: true,
    message: 'This user does not have a subscription.'
};

const subHandler = paramHandler('all', subscriptionExists);

Router.use(jwtHandler);
Router.use(authHandler);
Router.post('/checkout/:planId', [ noSubHandler, checkoutHandler ]);
Router.post('/confirm/:sessionId', [ noSubHandler, confirmHandler ]);
Router.post('/cancel/:subId', [ subHandler, cancelHandler ]);

export default Router;