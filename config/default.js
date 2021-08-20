module.exports = {
  app: {
    port: 8010,
  },

  db: {
    client: 'sqlite3',
    connection: ':memory:',
    pool: {
      min: 1,
      max: 1,
      destroyTimeoutMillis: 360000 * 1000,
      idleTimeoutMillis: 360000 * 1000,
    },
  },
};
