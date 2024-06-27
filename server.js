// server.js

const express = require('express');
const routes = require('./routes/index');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json()); // Add this line to parse JSON request bodies
app.use('/', routes);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
