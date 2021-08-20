const express = require('express');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

module.exports = {
  configureServer: () => {
    const app = express();

    app.use(express.json());

    app.use(routes);

    app.use(errorHandler);

    return app;
  },
};
