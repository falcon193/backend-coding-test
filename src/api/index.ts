import express from 'express';
import routes from './routes';
import errorHandler from './middlewares/errorHandler';

export const configureServer = (): express.Application => {
  const app = express();

  app.use(express.json());

  app.use(routes);

  app.use(errorHandler);

  return app;
};
