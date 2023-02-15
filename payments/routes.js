import express from 'express';
import { authHandler, paramHandler } from '../utilities/handlers';
import { checkoutHandler, confirmHandler } from './handlers';

const Router = express.Router();

const jwtExists = {
    firstArg: { from: { from: 'req', find: 'headers' }, find: 'authorization' },
    existence: true,
    message: 'The authorization field is not specified.'
};

const jwtHandler = paramHandler('all', jwtExists);

Router.use(jwtHandler);
Router.use(authHandler);
Router.post('/checkout/:planId', checkoutHandler);
Router.post('/confirm/:sessionId', confirmHandler);

export default Router;