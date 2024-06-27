// worker.js

const Bull = require('bull');
const fs = require('fs');
const path = require('path');
const imageThumbnail = require('image-thumbnail');
const dbClient = require('./utils/db');
const fileQueue = new Bull('fileQueue');

fileQueue.process(async (job, done) => {
  const { userId, fileId } = job.data;

  if (!fileId) {
    return done(new Error('Missing fileId'));
  }

  if (!userId) {
    return done(new Error('Missing userId'));
  }

  const file = await dbClient.db.collection('files').findOne({
    _id: dbClient.db.ObjectId(fileId),
    userId: dbClient.db.ObjectId(userId),
  });

  if (!file) {
    return done(new Error('File not found'));
  }

  const sizes = [500, 250, 100];
  const options = sizes.map(size => ({ width: size }));

  for (const option of options) {
    const thumbnail = await imageThumbnail(file.localPath, option);
    const thumbnailPath = `${file.localPath}_${option.width}`;
    fs.writeFileSync(thumbnailPath, thumbnail);
  }

  done();
});
