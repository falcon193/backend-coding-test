const appFactory = require('./src/app');
const logger = require('./src/utils/logger');
const db = require('./src/utils/db');
const buildSchemas = require('./src/schemas');

const port = 8010;

buildSchemas(db).then(() => {
  const app = appFactory(db);
  app.listen(port, () => logger.info(`App started and listening on port ${port}`));
});
