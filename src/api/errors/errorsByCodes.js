module.exports = Object.freeze({
  START_LAT_OR_LONG_INVALID: {
    statusCode: 200, // We have to keep it 200 for backward compatibility, @TODO change to 400
    data: {
      error_code: 'VALIDATION_ERROR',
      message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
    },
  },
  END_LAT_OR_LONG_INVALID: {
    statusCode: 200, // We have to keep it 200 for backward compatibility, @TODO change to 400
    data: {
      error_code: 'VALIDATION_ERROR',
      message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively',
    },
  },
  RIDER_NAME_INVALID: {
    statusCode: 200, // We have to keep it 200 for backward compatibility, @TODO change to 400
    data: {
      error_code: 'VALIDATION_ERROR',
      message: 'Rider name must be a non empty string',
    },
  },
  DRIVER_NAME_INVALID: {
    statusCode: 200, // We have to keep it 200 for backward compatibility, @TODO change to 400
    data: {
      error_code: 'VALIDATION_ERROR',
      message: 'Driver name must be a non empty string',
    },
  },
  DRIVER_VEHICLE_INVALID: {
    statusCode: 200, // We have to keep it 200 for backward compatibility, @TODO change to 400
    data: {
      error_code: 'VALIDATION_ERROR',
      message: 'Driver vehicle must be a non empty string',
    },
  },
  PAGINATION_PARAMETERS_INVALID: {
    statusCode: 200, // We have to keep it 200 for backward compatibility, @TODO change to 400
    data: {
      error_code: 'QUERY_VALIDATION_ERROR',
      message: 'Either "page" or "pageSize" parameter is invalid',
    },
  },
  RIDES_NOT_FOUND: {
    statusCode: 200, // We have to keep it 200 for backward compatibility, @TODO change to 404
    data: {
      error_code: 'RIDES_NOT_FOUND_ERROR',
      message: 'Could not find any rides',
    },
  },
  INTERNAL_ERROR: {
    statusCode: 200, // We have to keep it 200 for backward compatibility, @TODO change to 500
    data: {
      error_code: 'SERVER_ERROR',
      message: 'Unknown error',
    },
  },
});
