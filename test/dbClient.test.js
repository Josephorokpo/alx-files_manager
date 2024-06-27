// test/dbClient.test.js
const { expect } = require('chai');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dbClient = require('../utils/db');

let mongoServer;

describe('dbClient', () => {
  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = mongoServer.instanceInfo.port;
    process.env.DB_DATABASE = 'files_manager_test';
    await dbClient.connect();
  });

  after(async () => {
    await dbClient.db.dropDatabase();
    await dbClient.db.client.close();
    await mongoServer.stop();
  });

  it('should be alive', () => {
    expect(dbClient.isAlive()).to.be.true;
  });

  it('should return the number of users', async () => {
    const nbUsers = await dbClient.nbUsers();
    expect(nbUsers).to.equal(0);
  });

  it('should return the number of files', async () => {
    const nbFiles = await dbClient.nbFiles();
    expect(nbFiles).to.equal(0);
  });
});
