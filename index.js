import 'dotenv/config';
import Express from 'express';
import CookieParser from 'cookie-parser';
import Cors from 'cors';
import FileUploader from 'express-fileupload';
import Users from './users/routes';
import Documents from './documents/routes';
import Objects from './objects/routes';
import Payments from './payments/routes';
import Deployer from './deployer/routes';

const app = Express();
const port = process.env.PORT || 8080;

app.use(Express.urlencoded({ extended: true }));
app.use(Express.json());
app.use(CookieParser());
app.use(Cors({ credentials: true, origin: true }));
app.use(FileUploader( { limits: { fileSize: 5 * 1024 * 1024 } } ));
app.use('/users', Users);
app.use('/documents', Documents);
app.use('/objects', Objects);
app.use('/payments', Payments);
app.use('/deployer', Deployer);

app.listen(port);

export default app;