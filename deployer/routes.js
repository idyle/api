import express from 'express';
import { authHandler, paramHandler, payHandler, reqHandler } from '../utilities/handlers.js';
import { domainPostHandler, deployPostHandler, domainDeleteHandler, deployGetHandler, postWebsiteHandler, getWebsiteHandler } from './handlers.js';

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
Router.route('/websites/:website?')
.get(getWebsiteHandler)
.post(postWebsiteHandler);
Router.route('/deploys/:website?')
.get(deployGetHandler)
.post([ filesHandler, deployPostHandler ]);
Router.route('/domains/:website/:domain?')
.post(domainPostHandler)
.delete(domainDeleteHandler);

export default Router;