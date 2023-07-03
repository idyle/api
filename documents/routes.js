import express from 'express';
import { insertHandler, listHandler, updateHandler, setHandler, deleteHandler, getHandler} from './handlers.js';
import { paramHandler, authHandler, payHandler, dataHandler, reqHandler } from '../utilities/handlers.js';

const Router = express.Router();

const converter = paramHandler(
    'optional',
    {
        firstArg: { from: { from: 'req', find: 'params' }, find: 'collection' },
        secondArg: 'user',
        equality: true,
        origin: { from: 'res', find: 'collection' },
        assign: { from: { from: 'res', find: 'user' }, find: 'uid' } 
    }
);

const userMatchesCollection = {
    firstArg: { from: 'res', find: 'collection' },
    secondArg: { from: { from: 'res', find: 'user' }, find: 'uid' },
    equality: true,
    template: 'users/*/collections/services/documents',
    message: 'This request does not match this user.'
};

const userHandler = paramHandler('all', userMatchesCollection);

Router.use(authHandler);
Router.use(payHandler);
Router.use(reqHandler);
Router.use('/:op/:collection/:id?', converter);
Router.use('/:op/:collection/:id?', userHandler);
Router.route('/collections/:collection').get(listHandler);
Router.route('/documents/:collection/:id')
.get(getHandler)
.post([ dataHandler, insertHandler ])
.patch([ dataHandler, updateHandler ])
.put([ dataHandler, setHandler ])
.delete(deleteHandler);
// Router.post('/insert/:collection/:id', [ dataHandler, insertHandler ]);
// Router.post('/list/:collection', listHandler);
// Router.post('/update/:collection/:id', [ dataHandler, updateHandler ]);
// Router.post('/set/:collection/:id', [ dataHandler, setHandler ]);
// Router.post('/delete/:collection/:id', deleteHandler);
// Router.post('/get/:collection/:id', getHandler);

export default Router;