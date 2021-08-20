const { expect } = require('chai');
const request = require('supertest');
const db = require('../src/utils/db');
const { configureServer } = require('../src/api');
const { buildSchemas } = require('../src/schemas');

describe('API tests', () => {
  const app = configureServer();

  before(() => buildSchemas(db));
  after(() => db.destroy());

  describe('Health API', () => {
    describe('GET /health', () => {
      it('should return health', () => {
        return request(app)
          .get('/health')
          .expect('Content-Type', /text/)
          .expect(200);
      });
    });
  });

  describe('Rides API', () => {
    const idsOfCreatedRides = [];

    after(() => {
      return db.table('Rides').delete().whereIn('rideID', idsOfCreatedRides);
    });

    describe('POST /rides', () => {
      const sampleRide = {
        start_lat: -35,
        start_long: 91,
        end_lat: 21,
        end_long: -107,
        rider_name: 'Rider name',
        driver_name: 'Driver name',
        driver_vehicle: 'Driver vehicle',
      };

      const tryToCreateRideAndExpectCertainResponse = (ride, responseStatus, responseChecker) => {
        return request(app)
          .post('/rides')
          .send(ride)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((res) => {
            const { body } = res;
            responseChecker(body);
          });
      };

      it('should create ride if correct data is passed', () => {
        return tryToCreateRideAndExpectCertainResponse(sampleRide, 200, (body) => {
          expect(Array.isArray(body)).equal(true);
          expect(body[0]).to.have.property('rideID').that.is.a('number');
          expect(body[0].startLat).equal(sampleRide.start_lat);
          expect(body[0].startLong).equal(sampleRide.start_long);
          expect(body[0].endLat).equal(sampleRide.end_lat);
          expect(body[0].endLong).equal(sampleRide.end_long);
          expect(body[0].riderName).equal(sampleRide.rider_name);
          expect(body[0].driverName).equal(sampleRide.driver_name);
          expect(body[0].driverVehicle).equal(sampleRide.driver_vehicle);
          expect(body[0]).to.have.property('created').that.is.a('string');

          idsOfCreatedRides.push(body[0].rideID);
        });
      });

      it('should throw validation error if "start_lat" is invalid', () => {
        return tryToCreateRideAndExpectCertainResponse(
          { ...sampleRide, start_lat: -91 },
          200,
          (body) => {
            expect(body.error_code).equal('VALIDATION_ERROR');
          },
        );
      });

      it('should throw validation error if "start_long" is invalid', () => {
        return tryToCreateRideAndExpectCertainResponse(
          { ...sampleRide, start_long: 180.1 },
          200,
          (body) => {
            expect(body.error_code).equal('VALIDATION_ERROR');
          },
        );
      });

      it('should throw validation error if "end_lat" is invalid', () => {
        return tryToCreateRideAndExpectCertainResponse(
          { ...sampleRide, end_lat: 90.42 },
          200,
          (body) => {
            expect(body.error_code).equal('VALIDATION_ERROR');
          },
        );
      });

      it('should throw validation error if "end_long" is invalid', () => {
        return tryToCreateRideAndExpectCertainResponse(
          { ...sampleRide, end_long: -1822 },
          200,
          (body) => {
            expect(body.error_code).equal('VALIDATION_ERROR');
          },
        );
      });

      it('should throw validation error if "rider_name" is invalid', () => {
        return tryToCreateRideAndExpectCertainResponse(
          { ...sampleRide, rider_name: '' },
          200,
          (body) => {
            expect(body.error_code).equal('VALIDATION_ERROR');
          },
        );
      });

      it('should throw validation error if "driver_name" is invalid', () => {
        return tryToCreateRideAndExpectCertainResponse({ ...sampleRide, driver_name: '' }, 200, (body) => {
          expect(body.error_code).equal('VALIDATION_ERROR');
        });
      });

      it('should throw validation error if "driver_vehicle" is invalid', () => {
        return tryToCreateRideAndExpectCertainResponse({ ...sampleRide, driver_vehicle: '' }, 200, (body) => {
          expect(body.error_code).equal('VALIDATION_ERROR');
        });
      });
    });

    describe('GET /rides', () => {
      it('should return first page of rides if no pagination params are passed', () => {
        return request(app)
          .get('/rides')
          .expect('Content-Type', /json/)
          .expect(200)
          .then((res) => {
            const { body } = res;

            expect(Array.isArray(body.data)).equal(true);
            expect(body.data.length).greaterThanOrEqual(1);
            expect(body.data[0]).to.have.property('rideID').that.is.a('number');
            expect(body.data[0]).to.have.property('startLat').that.is.a('number');
            expect(body.data[0]).to.have.property('startLong').that.is.a('number');
            expect(body.data[0]).to.have.property('endLat').that.is.a('number');
            expect(body.data[0]).to.have.property('endLong').that.is.a('number');
            expect(body.data[0]).to.have.property('riderName').that.is.a('string').with.length.greaterThanOrEqual(1);
            expect(body.data[0]).to.have.property('driverName').that.is.a('string').with.length.greaterThanOrEqual(1);
            expect(body.data[0]).to.have.property('driverVehicle').that.is.a('string').with.length.greaterThanOrEqual(1);
            expect(body.data[0]).to.have.property('created').that.is.a('string');

            expect(body.meta).to.have.property('total').that.is.a('number').greaterThanOrEqual(1);
            expect(body.meta).to.have.property('currentPage').that.is.a('number').equal(1);
            expect(body.meta).to.have.property('pageSize').that.is.a('number').equal(10);
            expect(body.meta).to.have.property('pagesTotal').that.is.a('number').greaterThanOrEqual(1);
          });
      });

      it('should return certain page of rides if pagination params are passed', () => {
        return request(app)
          .get('/rides?page=2&pageSize=1')
          .expect('Content-Type', /json/)
          .expect(200)
          .then((res) => {
            const { body } = res;

            expect(Array.isArray(body.data)).equal(true);
            if (body.data[0]) {
              expect(body.data[0]).to.have.property('rideID').that.is.a('number');
              expect(body.data[0]).to.have.property('startLat').that.is.a('number');
              expect(body.data[0]).to.have.property('startLong').that.is.a('number');
              expect(body.data[0]).to.have.property('endLat').that.is.a('number');
              expect(body.data[0]).to.have.property('endLong').that.is.a('number');
              expect(body.data[0]).to.have.property('riderName').that.is.a('string').with.length.greaterThanOrEqual(1);
              expect(body.data[0]).to.have.property('driverName').that.is.a('string').with.length.greaterThanOrEqual(1);
              expect(body.data[0]).to.have.property('driverVehicle').that.is.a('string').with.length.greaterThanOrEqual(1);
              expect(body.data[0]).to.have.property('created').that.is.a('string');
            }

            expect(body.meta).to.have.property('total').that.is.a('number').greaterThanOrEqual(1);
            expect(body.meta).to.have.property('currentPage').that.is.a('number').equal(2);
            expect(body.meta).to.have.property('pageSize').that.is.a('number').equal(1);
            expect(body.meta).to.have.property('pagesTotal').that.is.a('number').greaterThanOrEqual(1);
          });
      });

      it('should throw query validation error if invalid pagination params are passed', () => {
        return request(app)
          .get('/rides?page=-2&pageSize=-10')
          .expect('Content-Type', /json/)
          .expect(200)
          .then((res) => {
            const { body } = res;

            expect(body.error_code).equal('QUERY_VALIDATION_ERROR');
          });
      });
    });

    describe('GET /rides/:id', () => {
      it('should return ride if correct id is passed', () => {
        return request(app)
          .get(`/rides/${idsOfCreatedRides[0]}`)
          .expect('Content-Type', /json/)
          .expect(200)
          .then((res) => {
            const { body } = res;

            expect(Array.isArray(body)).equal(true);
            expect(body.length).equal(1);
            expect(body[0]).to.have.property('rideID').that.is.a('number');
            expect(body[0]).to.have.property('startLat').that.is.a('number');
            expect(body[0]).to.have.property('startLong').that.is.a('number');
            expect(body[0]).to.have.property('endLat').that.is.a('number');
            expect(body[0]).to.have.property('endLong').that.is.a('number');
            expect(body[0]).to.have.property('riderName').that.is.a('string').with.length.greaterThanOrEqual(1);
            expect(body[0]).to.have.property('driverName').that.is.a('string').with.length.greaterThanOrEqual(1);
            expect(body[0]).to.have.property('driverVehicle').that.is.a('string').with.length.greaterThanOrEqual(1);
            expect(body[0]).to.have.property('created').that.is.a('string');
          });
      });

      it('should throw not found error if invalid id is passed', () => {
        return request(app)
          .get('/rides/invalid')
          .expect('Content-Type', /json/)
          .expect(200)
          .then((res) => {
            const { body } = res;

            expect(body.error_code).equal('RIDES_NOT_FOUND_ERROR');
          });
      });
    });
  });
});
