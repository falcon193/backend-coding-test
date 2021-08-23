import errorsByCodes from './errorsByCodes';

class ApiError {
  statusCode = 500;

  data: Record<string, any> = {};

  constructor(errorCode: string, additionalData: Record<string, any> = {}) {
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

export default ApiError;
