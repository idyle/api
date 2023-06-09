import express from 'express';
import { uploadHandler, deleteHandler, listHandler, archiveHandler, getHandler, publicHandler } from './handlers.js';
import { paramHandler, authHandler, payHandler, dataHandler, reqHandler } from '../utilities/handlers.js';

const Router = express.Router();

const converter = paramHandler(
    'optional',
    {
        firstArg: { from: { from: 'req', find: 'params' }, find: 'folder' },
        secondArg: 'user',
        equality: true,
        origin: { from: 'res', find: 'folder' },
        assign: { from: { from: 'res', find: 'user' }, find: 'uid' } 
    }
);

const userMatchesFolder = {
    firstArg: { from: 'res', find: 'folder' },
    secondArg: { from: { from: 'res', find: 'user' }, find: 'uid' },
    equality: true,
    template: 'users/*/folders/services/objects',
    message: 'This request does not match this user.'
};

const userHandler = paramHandler('all', userMatchesFolder);

Router.use(authHandler);
Router.use(payHandler);
Router.use(reqHandler);
Router.use('/:op/:folder/:file?', converter);
Router.use('/:op/:folder/:file?', userHandler);
Router.route('/folders/:folder').get(listHandler);
Router.route('/archive/:folder').post(archiveHandler);
Router.route('/files/:folder/:file')
.get(getHandler)
.post([ dataHandler, uploadHandler ])
.patch(publicHandler)
.delete(deleteHandler)

// Router.post('/upload/:folder/:file', [ dataHandler, uploadHandler ]);
// Router.post('/list/:folder', listHandler);
// Router.post('/delete/:folder/:file', deleteHandler);
// Router.post('/download/:folder/:file', downloadHandler);
// Router.post('/get/:folder/:file', getHandler);
// Router.post('/public/:folder/:file', publicHandler);
// Router.post('/archive/:folder', archiveHandler);

export default Router;