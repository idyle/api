import express from 'express';
import { authHandler, paramHandler, payHandler } from '../utilities/handlers';
import { convertBatchHandler, deleteHandler, listHandler, saveHandler } from './handlers';

const Router = express.Router();

// to be used for create and update 

const pageDataExists = {
    firstArg: { from: { from: 'req', find: 'body' }, find: 'page' },
    existence: true,
    message: 'There is no page data included in the request.'
};

const pageDataHandler = paramHandler('all', pageDataExists);

// for the converters

const detectCustomPath = {
    firstArg: { from: { from: 'req', find: 'query' }, find: 'type' },
    secondArg: 'custom',
    equality: true,
    template: 'users/*/collections/services/documents',
    origin: { from: 'res', find: 'path' },
    source: { from: { from: 'res', find: 'user' }, find: 'uid' } 
    // testing out custom sourcing
};

const customPathHandler = paramHandler('optional', detectCustomPath);

const detectUser = {
    firstArg: { from: { from: 'req', find: 'params' }, find: 'path' },
    secondArg: 'user',
    equality: true,
    origin: { from: 'res', find: 'path' },
    assign: { from: { from: 'res', find: 'user' }, find: 'uid' } 
};

const convertHandler = paramHandler('optional', detectUser);

const userMatchesPath = {
    firstArg: { from: 'res', find: 'path' },
    secondArg: { from: { from: 'res', find: 'user' }, find: 'uid' },
    equality: true,
    template: 'users/*/collections/services/editor/data/pages',
    message: 'This request does not match this user.'
};

const userHandler = paramHandler('all', userMatchesPath);

Router.use(authHandler);
Router.use(payHandler);
Router.use('/:op/:path/:page?', convertHandler);
Router.use('/:op/:path/:page?', userHandler);
Router.post('/convert/:path/:page', [ customPathHandler, convertHandler ]);
Router.post('/save/:path/:page', [ pageDataHandler, saveHandler ]);
// Router.post('/update/:path/:page', [ pageDataHandler, updateHandler ]);
Router.post('/batchconvert/:path', convertBatchHandler);
// Router.post('/get/:path/:page', getHandler);
Router.post('/delete/:path/:page', deleteHandler);
Router.post('/list/:path', listHandler);

export default Router;