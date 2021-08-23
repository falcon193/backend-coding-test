/* eslint-disable global-require */
import express from 'express';

import ridesController from '../controllers/rides';

const controllers = {
  rides: ridesController,
};

const router = express.Router();

router.get('/health', (req: express.Request, res: express.Response) => res.send('Healthy'));

router.post('/rides', controllers.rides.create);
router.get('/rides', controllers.rides.list);
router.get('/rides/:id', controllers.rides.get);

export default router;
