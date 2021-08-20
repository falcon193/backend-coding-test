const config = require('config');
const { configureServer } = require('./api');
const logger = require('./utils/logger');
const db = require('./utils/db');
const { buildSchemas } = require('./schemas');

const initApp = async () => {
  await buildSchemas(db);

  const server = configureServer();

  return new Promise((resolve) => {
    server.listen(config.get('app.port'), () => {
      resolve();
    });
  });
};

process.on('uncaughtException', (error) => {
  logger.error(`uncaughtException: ${error.stack}`);
  if (['EMFILE', 'EADDRINUSE', 'EACCES'].includes(error.name)) {
    process.exit(1);
  }
});
process.on('unhandledRejection', (error) => {
  logger.error(`unhandledRejection: ${error.stack}`);
});

initApp()
  .then(() => {
    logger.info(`App started and listening on port ${config.get('app.port')}`);
  })
  .catch((error) => {
    logger.error(`Couldn't initialize the app: ${error.stack}`);
    process.exit(1);
  });
