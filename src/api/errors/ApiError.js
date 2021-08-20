const errorsByCodes = require('./errorsByCodes');

class ApiError {
  constructor(errorCode, additionalData) {
    Error.call(this);
    Error.captureStackTrace(this);

    Object.assign(
      this,
      {
        ...errorsByCodes[errorCode],
        data: {
          ...errorsByCodes[errorCode].data,
          ...additionalData,
        },
      },
    );
  }
}

module.exports = ApiError;
