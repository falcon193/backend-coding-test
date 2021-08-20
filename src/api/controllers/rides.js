const db = require('../../utils/db');
const ApiError = require('../errors/ApiError');

module.exports = {
  create: async (req, res, next) => {
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
        throw new ApiError('START_LAT_OR_LONG_INVALID');
      }
      if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
        throw new ApiError('END_LAT_OR_LONG_INVALID');
      }
      if (typeof riderName !== 'string' || riderName.length < 1) {
        throw new ApiError('RIDER_NAME_INVALID');
      }
      if (typeof driverName !== 'string' || driverName.length < 1) {
        throw new ApiError('DRIVER_NAME_INVALID');
      }
      if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
        throw new ApiError('DRIVER_VEHICLE_INVALID');
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

      res.json([ride]); // We have to return array of one element for now to be backward compatible
    } catch (error) {
      return next(error);
    }
  },
  list: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const pageSize = parseInt(req.query.pageSize, 10) || 10;

      if (page < 1 || pageSize < 1) {
        throw new ApiError('PAGINATION_PARAMETERS_INVALID');
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
      return next(error);
    }
  },
  get: async (req, res, next) => {
    try {
      const ride = await db.table('Rides').first().where({ rideID: req.params.id });

      if (!ride) {
        throw new ApiError('RIDES_NOT_FOUND');
      }

      res.json([ride]); // We have to return array of one element for now to be backward compatible
    } catch (error) {
      return next(error);
    }
  },
};
