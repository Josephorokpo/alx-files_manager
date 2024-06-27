import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes/index';

const app = express();

app.use(bodyParser.json());
app.use(routes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

export default app;
