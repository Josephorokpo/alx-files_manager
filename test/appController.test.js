// test/appController.test.js
const { expect } = require('chai');
const request = require('chai-http');
const server = require('../server');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

chai.use(request);

describe('AppController', () => {
  before(async () => {
    await redisClient.client.flushall();
    await dbClient.db.dropDatabase();
  });

  it('GET /status should return redis and db status', (done) => {
    chai.request(server)
      .get('/status')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({ redis: true, db: true });
        done();
      });
  });

  it('GET /stats should return number of users and files', (done) => {
    chai.request(server)
      .get('/stats')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({ users: 0, files: 0 });
        done();
      });
  });
});
