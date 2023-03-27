import express from 'express';
import { authHandler, paramHandler, payHandler } from '../utilities/handlers';
import { convertHandler, deployHandler, listHandler, setupHandler } from './handlers';

const Router = express.Router();

const filesExist = {
    firstArg: { from: { from: 'req', find: 'body' }, find: 'files' },
    existence: true,
    message: 'There are no files included in the request.'
};

const filesHandler = paramHandler('all', filesExist);

Router.use(authHandler);
Router.use(payHandler);

Router.post('/setup/:website', setupHandler);
Router.post('/deploy/:website', [ filesHandler, deployHandler ]);
Router.post('/list', listHandler);
Router.post('/convert/:path', convertHandler);
// setup /:website 
// deploy /:website + req.body.files + query revert (files exists)
// list queries: filter, value
// convert /:path, queries: source

export default Router;