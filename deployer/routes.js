import express from 'express';
import { authHandler, paramHandler, payHandler, reqHandler } from '../utilities/handlers.js';
import { deployHandler, listHandler, setupHandler, websiteHandler } from './handlers.js';

const Router = express.Router();

const filesExist = {
    firstArg: { from: { from: 'req', find: 'body' }, find: 'files' },
    existence: true,
    message: 'There are no files included in the request.'
};

const filesHandler = paramHandler('all', filesExist);

Router.use(authHandler);
Router.use(payHandler);
Router.use(reqHandler);
Router.post('/setup/:website', setupHandler);
Router.post('/deploy/:website', [ filesHandler, deployHandler ]);
Router.post('/list', listHandler);
Router.post('/get', websiteHandler);

export default Router;