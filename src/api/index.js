const express = require('express');
const routes = require('./routes');

module.exports = {
  configureServer: () => {
    const app = express();

    app.use(express.json());

    app.use(routes);

    return app;
  },
};