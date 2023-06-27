import express from 'express';
import { authHandler, paramHandler, payHandler, reqHandler, dataHandler } from '../utilities/handlers.js';
import { convertBatchHandler, deleteHandler, listHandler, convertHandler, getHandler, createHandler, editHandler } from './handlers.js';

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

const convertUserHandler = paramHandler('optional', detectUser);

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
Router.use(reqHandler);
Router.use('/:op/:path/:id?', convertUserHandler);
Router.use('/:op/:path/:id?', userHandler);
Router.post('/convert/:path/:id', [ customPathHandler, convertHandler ]);
Router.post('/create/:path', [ dataHandler, pageDataHandler, createHandler ]);
Router.post('/edit/:path/:id', [ dataHandler, pageDataHandler, editHandler ]);
// Router.post('/save/:path/:id?', [ pageDataHandler, dataHandler, saveHandler ]);
Router.post('/batchconvert/:path', convertBatchHandler);
Router.post('/get/:path/:id', getHandler);
Router.post('/delete/:path/:id', deleteHandler);
Router.post('/list/:path', listHandler);

export default Router;