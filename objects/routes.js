import express from 'express';
import { uploadHandler, deleteHandler, listHandler, downloadHandler, archiveHandler } from './handlers';
import { paramHandler, authHandler } from '../utilities/handlers';

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
Router.use('/:op/:folder/:file?', converter);
Router.use('/:op/:folder/:file?', userHandler);
Router.post('/upload/:folder/:file', uploadHandler);
Router.post('/list/:folder', listHandler);
Router.post('/delete/:folder/:file', deleteHandler);
Router.post('/download/:folder/:file', downloadHandler);
Router.post('/archive/:folder', archiveHandler);

export default Router;