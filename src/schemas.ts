import { Knex } from 'knex';

export const buildSchemas = async (db: Knex): Promise<void> => {
  await db.schema.createTable('Rides', (table: Knex.CreateTableBuilder) => {
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
};
