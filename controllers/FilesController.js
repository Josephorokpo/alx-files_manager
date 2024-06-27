// controllers/FilesController.js

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');
const mime = require('mime-types');
const Bull = require('bull');
const fileQueue = new Bull('fileQueue');

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    const { name, type, parentId = 0, isPublic = false, data } = req.body;

    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type || !['folder', 'file', 'image'].includes(type)) return res.status(400).json({ error: 'Missing type' });
    if (!data && type !== 'folder') return res.status(400).json({ error: 'Missing data' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    if (parentId !== 0) {
      const parentFile = await dbClient.db.collection('files').findOne({ _id: dbClient.db.ObjectId(parentId) });
      if (!parentFile) return res.status(400).json({ error: 'Parent not found' });
      if (parentFile.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
    }

    const newFile = {
      userId: dbClient.db.ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId === 0 ? 0 : dbClient.db.ObjectId(parentId),
    };

    if (type !== 'folder') {
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

      const localPath = path.join(folderPath, uuidv4());
      fs.writeFileSync(localPath, Buffer.from(data, 'base64'));
      newFile.localPath = localPath;
    }

    const result = await dbClient.db.collection('files').insertOne(newFile);

    if (type === 'image') {
      fileQueue.add({ userId, fileId: result.insertedId.toString() });
    }

    res.status(201).json({
      id: result.insertedId,
      userId,
      name,
      type,
      isPublic,
      parentId,
    });
  }

  static async getShow(req, res) {
    const token = req.headers['x-token'];
    const fileId = req.params.id;

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const file = await dbClient.db.collection('files').findOne({
      _id: dbClient.db.ObjectId(fileId),
      userId: dbClient.db.ObjectId(userId),
    });

    if (!file) return res.status(404).json({ error: 'Not found' });

    res.status(200).json(file);
  }

  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    const { parentId = 0, page = 0 } = req.query;

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const files = await dbClient.db.collection('files')
      .aggregate([
        { $match: { parentId: parentId === '0' ? 0 : dbClient.db.ObjectId(parentId), userId: dbClient.db.ObjectId(userId) } },
        { $skip: page * 20 },
        { $limit: 20 },
      ])
      .toArray();

    res.status(200).json(files);
  }

  static async putPublish(req, res) {
    const token = req.headers['x-token'];
    const fileId = req.params.id;

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const file = await dbClient.db.collection('files').findOne({
      _id: dbClient.db.ObjectId(fileId),
      userId: dbClient.db.ObjectId(userId),
    });

    if (!file) return res.status(404).json({ error: 'Not found' });

    await dbClient.db.collection('files').updateOne(
      { _id: dbClient.db.ObjectId(fileId) },
      { $set: { isPublic: true } }
    );

    res.status(200).json({ ...file, isPublic: true });
  }

  static async putUnpublish(req, res) {
    const token = req.headers['x-token'];
    const fileId = req.params.id;

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const file = await dbClient.db.collection('files').findOne({
      _id: dbClient.db.ObjectId(fileId),
      userId: dbClient.db.ObjectId(userId),
    });

    if (!file) return res.status(404).json({ error: 'Not found' });

    await dbClient.db.collection('files').updateOne(
      { _id: dbClient.db.ObjectId(fileId) },
      { $set: { isPublic: false } }
    );

    res.status(200).json({ ...file, isPublic: false });
  }

  static async getFile(req, res) {
    const token = req.headers['x-token'];
    const fileId = req.params.id;
    const size = req.query.size;

    const file = await dbClient.db.collection('files').findOne({ _id: dbClient.db.ObjectId(fileId) });

    if (!file) return res.status(404).json({ error: 'Not found' });

    if (!file.isPublic) {
      if (!token) return res.status(404).json({ error: 'Not found' });

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId || userId !== file.userId.toString()) return res.status(404).json({ error: 'Not found' });
    }

    if (file.type === 'folder') return res.status(400).json({ error: "A folder doesn't have content" });

    let filePath = file.localPath;
    if (size && ['500', '250', '100'].includes(size)) {
      const sizeFilePath = `${filePath}_${size}`;
      if (fs.existsSync(sizeFilePath)) filePath = sizeFilePath;
      else return res.status(404).json({ error: 'Not found' });
    }

    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });

    const mimeType = mime.lookup(file.name);
    res.setHeader('Content-Type', mimeType);
    return res.sendFile(filePath);
  }
}

module.exports = FilesController;
