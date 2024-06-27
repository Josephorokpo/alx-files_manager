import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../server'; // Adjust the path according to your project structure

const { expect } = chai;
chai.use(chaiHttp);

describe('AppController', () => {
  describe('GET /status', () => {
    it('should return status code 200', (done) => {
      chai.request(app)
        .get('/status')
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });
  });

  // Add more tests for other endpoints here
});
