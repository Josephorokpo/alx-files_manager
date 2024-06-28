// worker.js

const Queue = require('bull');
const { userQueue } = require('./queues');

// Define userQueue
const userQueue = new Queue('userQueue', REDIS_URL);

// Process userQueue
userQueue.process(async (job) => {
  const { userId } = job.data;

  if (!userId) {
    throw new Error('Missing userId');
  }

  // Example: Find user in the database based on userId
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Replace with actual email sending logic
  console.log(`Welcome ${user.email}!`);
});

module.exports = {
  userQueue
};
