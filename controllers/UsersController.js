// controllers/UsersController.js

const User = require('../models/User');
const crypto = require('crypto');
const Queue = require('bull');
const userQueue = new Queue('userQueue');

class UsersController {
  static async store(req, res) {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash the password
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

      // Create the user
      const newUser = new User({
        email,
        password: hashedPassword,
      });

      // Save the user to the database
      await newUser.save();

      // Add job to userQueue
      userQueue.add({ userId: newUser._id });

      // Return the created user
      return res.status(201).json(newUser);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getUser(req, res) {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async authenticate(req, res) {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
      if (hashedPassword !== user.password) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      return res.status(200).json({ token });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async disconnect(req, res) {
    try {
      req.user = null;
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = UsersController;
