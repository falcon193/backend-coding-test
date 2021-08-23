import express from 'express';

import logger from '../../utils/logger';
import ApiError from '../errors/ApiError';
import errorsByCodes from '../errors/errorsByCodes';

export default (
  error: Error | ApiError,
  req: express.Request,
  res: express.Response,
  // "next" argument is required, because otherwise express isn't gonna call it
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: express.NextFunction,
): void => {
  if (error instanceof ApiError) {
    res.status(error.statusCode);
    res.json(error.data);
  } else {
    logger.error(error);

    res.status(errorsByCodes.INTERNAL_ERROR.statusCode);
    res.json(errorsByCodes.INTERNAL_ERROR.data);
  }
};
