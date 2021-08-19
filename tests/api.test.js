const { expect } = require('chai');
const request = require('supertest');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');
const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');

describe('API tests', () => {
  before((done) => {
    db.serialize((err) => {
      if (err) {
        return done(err);
      }

      buildSchemas(db);

      done();
    });
  });

  describe('Health API', () => {
    describe('GET /health', () => {
      it('should return health', (done) => {
        request(app)
          .get('/health')
          .expect('Content-Type', /text/)
          .expect(200, done);
      });
    });
  });

  describe('Rides API', () => {
    const idsOfCreatedRides = [];

    after((done) => {
      db.run(`DELETE FROM Rides WHERE rideID IN (${idsOfCreatedRides.map(() => '?').join(',')})`, idsOfCreatedRides, done);
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

      it('should create ride if correct data is passed', (done) => {
        tryToCreateRideAndExpectCertainResponse(sampleRide, 200, (body) => {
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
        })
          .then(() => done())
          .catch((error) => done(error));
      });

      it('should throw validation error if "start_lat" is invalid', (done) => {
        tryToCreateRideAndExpectCertainResponse({ ...sampleRide, start_lat: -91 }, 200, (body) => {
          expect(body.error_code).equal('VALIDATION_ERROR');
        })
          .then(() => done())
          .catch((error) => done(error));
      });

      it('should throw validation error if "start_long" is invalid', (done) => {
        tryToCreateRideAndExpectCertainResponse(
          { ...sampleRide, start_long: 180.1 },
          200,
          (body) => {
            expect(body.error_code).equal('VALIDATION_ERROR');
          },
        )
          .then(() => done())
          .catch((error) => done(error));
      });

      it('should throw validation error if "end_lat" is invalid', (done) => {
        tryToCreateRideAndExpectCertainResponse({ ...sampleRide, end_lat: 90.42 }, 200, (body) => {
          expect(body.error_code).equal('VALIDATION_ERROR');
        })
          .then(() => done())
          .catch((error) => done(error));
      });

      it('should throw validation error if "end_long" is invalid', (done) => {
        tryToCreateRideAndExpectCertainResponse({ ...sampleRide, end_long: -1822 }, 200, (body) => {
          expect(body.error_code).equal('VALIDATION_ERROR');
        })
          .then(() => done())
          .catch((error) => done(error));
      });

      it('should throw validation error if "rider_name" is invalid', (done) => {
        tryToCreateRideAndExpectCertainResponse({ ...sampleRide, rider_name: '' }, 200, (body) => {
          expect(body.error_code).equal('VALIDATION_ERROR');
        })
          .then(() => done())
          .catch((error) => done(error));
      });

      it('should throw validation error if "driver_name" is invalid', (done) => {
        tryToCreateRideAndExpectCertainResponse({ ...sampleRide, driver_name: '' }, 200, (body) => {
          expect(body.error_code).equal('VALIDATION_ERROR');
        })
          .then(() => done())
          .catch((error) => done(error));
      });

      it('should throw validation error if "driver_vehicle" is invalid', (done) => {
        tryToCreateRideAndExpectCertainResponse({ ...sampleRide, driver_vehicle: '' }, 200, (body) => {
          expect(body.error_code).equal('VALIDATION_ERROR');
        })
          .then(() => done())
          .catch((error) => done(error));
      });
    });

    describe('GET /rides', () => {
      it('should return list of rides', (done) => {
        request(app)
          .get('/rides')
          .expect('Content-Type', /json/)
          .expect(200)
          .then((res) => {
            const { body } = res;

            expect(Array.isArray(body)).equal(true);
            expect(body.length).greaterThanOrEqual(1);
            expect(body[0]).to.have.property('rideID').that.is.a('number');
            expect(body[0]).to.have.property('startLat').that.is.a('number');
            expect(body[0]).to.have.property('startLong').that.is.a('number');
            expect(body[0]).to.have.property('endLat').that.is.a('number');
            expect(body[0]).to.have.property('endLong').that.is.a('number');
            expect(body[0]).to.have.property('riderName').that.is.a('string').with.length.greaterThanOrEqual(1);
            expect(body[0]).to.have.property('driverName').that.is.a('string').with.length.greaterThanOrEqual(1);
            expect(body[0]).to.have.property('driverVehicle').that.is.a('string').with.length.greaterThanOrEqual(1);
            expect(body[0]).to.have.property('created').that.is.a('string');

            return done();
          })
          .catch((error) => done(error));
      });
    });

    describe('GET /rides/:id', () => {
      it('should return ride if correct id is passed', (done) => {
        request(app)
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

            return done();
          })
          .catch((error) => done(error));
      });

      it('should throw not found error if invalid id is passed', (done) => {
        request(app)
          .get('/rides/invalid')
          .expect('Content-Type', /json/)
          .expect(200)
          .then((res) => {
            const { body } = res;

            expect(body.error_code).equal('RIDES_NOT_FOUND_ERROR');

            return done();
          })
          .catch((error) => done(error));
      });
    });
  });
});
