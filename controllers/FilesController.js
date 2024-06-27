// controllers/FilesController.js

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');
const mime = require('mime-types');

class FilesController {
  static async postUpload(req, res) {
    // (Existing code for postUpload)
  }

  static async getShow(req, res) {
    // (Existing code for getShow)
  }

  static async getIndex(req, res) {
    // (Existing code for getIndex)
  }

  static async putPublish(req, res) {
    // (Existing code for putPublish)
  }

  static async putUnpublish(req, res) {
    // (Existing code for putUnpublish)
  }

  static async getFile(req, res) {
    const token = req.headers['x-token'];
    const fileId = req.params.id;

    const file = await dbClient.db.collection('files').findOne({ _id: dbClient.db.ObjectId(fileId) });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (!file.isPublic) {
      if (!token) {
        return res.status(404).json({ error: 'Not found' });
      }

      const userId = await redisClient.get(`auth_${token}`);

      if (!userId || userId !== file.userId.toString()) {
        return res.status(404).json({ error: 'Not found' });
      }
    }

    if (file.type === 'folder') {
      return res.status(400).json({ error: "A folder doesn't have content" });
    }

    if (!fs.existsSync(file.localPath)) {
      return res.status(404).json({ error: 'Not found' });
    }

    const mimeType = mime.lookup(file.name);
    res.setHeader('Content-Type', mimeType);
    return res.sendFile(file.localPath);
  }
}

module.exports = FilesController;
