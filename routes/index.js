const express = require('express');
const router = express.Router();
const UsersController = require('../controllers/UsersController');
const FilesController = require('../controllers/FilesController');
const { userQueue, fileQueue } = require('../worker');

// POST /users - Create a new user
router.post('/users', async (req, res) => {
  try {
    const user = await UsersController.store(req.body);
    
    // Add job to userQueue for sending welcome email
    await userQueue.add({ userId: user._id });

    return res.status(201).json(user);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// PUT /files/:id/publish
router.put('/files/:id/publish', FilesController.putPublish);

// PUT /files/:id/unpublish
router.put('/files/:id/unpublish', FilesController.putUnpublish);

// GET /files/:id/data
router.get('/files/:id/data', FilesController.getFile);

// POST /files - Create a new file
router.post('/files', async (req, res) => {
  try {
    const file = await FilesController.store(req.body, req.user);

    // Add job to fileQueue for generating thumbnails
    if (file.type === 'image') {
      await fileQueue.add({ userId: req.user._id, fileId: file._id });
    }

    return res.status(201).json(file);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// GET /status
router.get('/status', AppController.getStatus);

// GET /stats
router.get('/stats', AppController.getStats);

// GET /connect
router.get('/connect', AuthController.connect);

// GET /disconnect
router.get('/disconnect', AuthController.disconnect);

// GET /users/me
router.get('/users/me', UserController.getMe);

// GET /files/:id
router.get('/files/:id', FilesController.show);

// GET /files - List files with pagination
router.get('/files', FilesController.index);

module.exports = router;
