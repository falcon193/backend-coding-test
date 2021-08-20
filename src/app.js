const express = require('express');

module.exports = (db) => {
  const app = express();
  app.use(express.json());

  app.get('/health', (req, res) => res.send('Healthy'));

  app.post('/rides', async (req, res) => {
    try {
      const startLatitude = Number(req.body.start_lat);
      const startLongitude = Number(req.body.start_long);
      const endLatitude = Number(req.body.end_lat);
      const endLongitude = Number(req.body.end_long);
      const riderName = req.body.rider_name;
      const driverName = req.body.driver_name;
      const driverVehicle = req.body.driver_vehicle;

      if (startLatitude < -90 || startLatitude > 90
        || startLongitude < -180 || startLongitude > 180) {
        return res.send({
          error_code: 'VALIDATION_ERROR',
          message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
        });
      }
      if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
        return res.send({
          error_code: 'VALIDATION_ERROR',
          message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
        });
      }
      if (typeof riderName !== 'string' || riderName.length < 1) {
        return res.send({
          error_code: 'VALIDATION_ERROR',
          message: 'Rider name must be a non empty string',
        });
      }
      if (typeof driverName !== 'string' || driverName.length < 1) {
        return res.send({
          error_code: 'VALIDATION_ERROR',
          message: 'Rider name must be a non empty string',
        });
      }
      if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
        return res.send({
          error_code: 'VALIDATION_ERROR',
          message: 'Rider name must be a non empty string',
        });
      }

      const [rideId] = await db.table('Rides').insert({
        startLat: startLatitude,
        startLong: startLongitude,
        endLat: endLatitude,
        endLong: endLongitude,
        riderName,
        driverName,
        driverVehicle,
      });
      const ride = await db.table('Rides').first().where({ rideID: rideId });

      res.json([ride]); // We have to return array of one element to be backward compatible
    } catch (error) {
      res.send({
        error_code: 'SERVER_ERROR',
        message: 'Unknown error',
      });
    }
  });

  app.get('/rides', async (req, res) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const pageSize = parseInt(req.query.pageSize, 10) || 10;

      if (page < 1 || pageSize < 1) {
        return res.send({
          error_code: 'QUERY_VALIDATION_ERROR',
          message: 'Either "page" or "pageSize" parameter is invalid',
        });
      }

      const [
        [{ rowsTotal }],
        pageRows,
      ] = await Promise.all([
        db.table('Rides').select({ rowsTotal: db.raw('count(rideID)') }),
        db.table('Rides').select().limit(pageSize).offset((page - 1) * pageSize),
      ]);

      res.send({
        data: pageRows,
        meta: {
          total: rowsTotal,
          currentPage: page,
          pageSize,
          pagesTotal: Math.ceil(rowsTotal / pageSize),
        },
      });
    } catch (error) {
      res.send({
        error_code: 'SERVER_ERROR',
        message: 'Unknown error',
      });
    }
  });

  app.get('/rides/:id', async (req, res) => {
    try {
      const ride = await db.table('Rides').first().where({ rideID: req.params.id });

      if (!ride) {
        return res.send({
          error_code: 'RIDES_NOT_FOUND_ERROR',
          message: 'Could not find any rides',
        });
      }

      res.json([ride]); // We have to return array of one element to be backward compatible
    } catch (error) {
      res.send({
        error_code: 'SERVER_ERROR',
        message: 'Unknown error',
      });
    }
  });

  return app;
};
