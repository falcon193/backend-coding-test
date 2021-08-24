import config from 'config';
import { configureServer } from './api';
import logger from './utils/logger';
import db from './utils/db';
import { buildSchemas } from './schemas';

const initApp = async (): Promise<void> => {
  await buildSchemas(db);

  const server = configureServer();

  return new Promise((resolve) => {
    server.listen(config.get('app.port'), () => {
      resolve();
    });
  });
};

process.on('uncaughtException', (error: Error) => {
  logger.error(`uncaughtException: ${error.stack}`);
  if (['EMFILE', 'EADDRINUSE', 'EACCES'].includes(error.name)) {
    process.exit(1);
  }
});
process.on('unhandledRejection', (error: Error) => {
  logger.error(`unhandledRejection: ${error.stack}`);
});

initApp()
  .then(() => {
    logger.info(`App started and listening on port ${config.get('app.port')}`);
  })
  .catch((error: Error) => {
    logger.error(`Couldn't initialize the app: ${error.stack}`);
    process.exit(1);
  });
