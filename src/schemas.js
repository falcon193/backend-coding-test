module.exports = {
  buildSchemas: (db) => {
    return db.schema.createTable('Rides', (table) => {
      table.increments('rideID');
      table.decimal('startLat');
      table.decimal('startLong');
      table.decimal('endLat');
      table.decimal('endLong');
      table.string('riderName');
      table.string('driverName');
      table.string('driverVehicle');
      table.dateTime('created').defaultTo(db.fn.now());
    });
  },
};
