import express from 'express';

import user from './user';
import cert from './cert';
import msg from './msg';

const routes = express.Router();

routes.get('/ping', (req, res) => res.send('pong'));
routes.use('/user', user);
routes.use('/cert', cert);
routes.use('/msg', msg);

export default routes;
