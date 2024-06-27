// test/usersController.test.js
const { expect } = require('chai');
const request = require('chai-http');
const server = require('../server');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

chai.use(request);

describe('UsersController', () => {
  before(async () => {
    await redisClient.client.flushall();
    await dbClient.db.dropDatabase();
  });

  it('POST /users should create a new user', (done) => {
    chai.request(server)
      .post('/users')
      .send({ email: 'test@test.com', password: '123456' })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('email', 'test@test.com');
        done();
      });
  });

  it('GET /users/me should return the current user', (done) => {
    // Implement test logic for user authentication and retrieval
    done();
  });

  it('GET /connect should authenticate a user', (done) => {
    // Implement test logic for user authentication
    done();
  });

  it('GET /disconnect should log out the user', (done) => {
    // Implement test logic for user logout
    done();
  });
});
