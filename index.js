import 'dotenv/config';
import Express from 'express';
import CookieParser from 'cookie-parser';
import Cors from 'cors';
import FileUploader from 'express-fileupload';
import Auth from './auth/routes.js';
import Documents from './documents/routes.js';
import Objects from './objects/routes.js';
import Payments from './payments/routes.js';
import Deployer from './deployer/routes.js';
import Editor from './editor/routes.js';

const app = Express();
const port = process.env.PORT || 8080;

app.options('*', Cors());
app.use(Cors({ credentials: true, origin: true }));
app.use(Express.urlencoded({ extended: true }));
app.use(Express.json());
app.use(CookieParser());
app.use(FileUploader( { limits: { fileSize: 5 * 1024 * 1024 } } ));
app.use('/auth', Auth);
app.use('/documents', Documents);
app.use('/objects', Objects);
app.use('/payments', Payments);
app.use('/deployer', Deployer);
app.use('/editor', Editor);

app.listen(port);

export default app;