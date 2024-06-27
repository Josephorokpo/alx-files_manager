# Files Manager

Files Manager is a Node.js application for managing files with user authentication, file uploads, image processing, and file sharing functionalities. It uses technologies like Node.js, Express.js, MongoDB for database management, Redis for caching, and Bull for background job processing.

# Features

- User authentication (sign-up, sign-in, sign-out)
- File management (uploading, downloading, listing, updating, deleting)
- Image processing (thumbnail generation)
- File sharing (public/private files)

# Technologies Used

- Node.js - Server-side JavaScript runtime
- Express.js - Web application framework for Node.js
- MongoDB - NoSQL database for storing file metadata
- Redis - In-memory data structure store for caching
- Bull - Redis-backed queue for handling background jobs
- Mongoose - MongoDB object modeling for Node.js
- Image-Thumbnail - Node.js module for generating image thumbnails
- bcrypt - Library for hashing passwords
- jsonwebtoken - JSON Web Token (JWT) implementation for user authentication
- multer - Middleware for handling file uploads
- chai and mocha - Testing framework and assertion library for Node.js applications

# Prerequisites

- Node.js (v12 or higher)
- MongoDB database
- Redis server

# Installation

1.	Clone the repository:

git clone https://github.com/your-username/files-manager.git
cd files-manager

2.	Install dependencies:

npm install

3.	Set up environment variables:

Create a .env file in the root directory and provide the following variables:

PORT=3000
MONGODB_URI=mongodb://localhost:27017/files_manager
REDIS_URL=redis://localhost:6379
FOLDER_PATH=/tmp/files_manager

Adjust the MongoDB URI, Redis URL, and folder path as per your configuration.


4.	Start the application:

npm start

The application should now be running on http://localhost:3000.

5.	Run tests:

npm test


## API Endpoints

#Authentication

- POST /users - Create a new user
- GET /connect - Sign in with Basic Auth and receive a JWT token
- GET /disconnect - Sign out and invalidate JWT token
- GET /users/me - Retrieve current user details

# File Management

- POST /files - Upload a new file
- GET /files/:id - Retrieve file details by ID
- GET /files - Retrieve all files with pagination
- PUT /files/:id/publish - Publish a file
- PUT /files/:id/unpublish - Unpublish a file
- GET /files/:id/data - Retrieve file content by ID with optional size parameter for images

# Image Processing

- Automatically generates thumbnails for uploaded images in the background using Bull and Redis.

# License

- This project is licensed under the MIT License - see the LICENSE file for details.

# Author

- Joseph Orokpo











