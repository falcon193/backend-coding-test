const logger = require('../../utils/logger');
const ApiError = require('../errors/ApiError');
const { INTERNAL_ERROR } = require('../errors/errorsByCodes');

// "next" argument is required, because otherwise express isn't gonna call it
// eslint-disable-next-line no-unused-vars
module.exports = (error, req, res, next) => {
  if (error instanceof ApiError) {
    res.status(error.statusCode);
    res.json(error.data);
  } else {
    logger.error(error);

    res.status(INTERNAL_ERROR.statusCode);
    res.json(INTERNAL_ERROR.data);
  }
};
