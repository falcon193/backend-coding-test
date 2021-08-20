/* eslint-disable global-require */
const express = require('express');

const controllers = {
  rides: require('../controllers/rides'),
};

const router = express.Router();

router.get('/health', (req, res) => res.send('Healthy'));

router.post('/rides', controllers.rides.create);
router.get('/rides', controllers.rides.list);
router.get('/rides/:id', controllers.rides.get);

module.exports = router;
