const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const errorhandler = require('errorhandler');

const app = express();

const PORT = process.env.PORT || 4000;

const apiRouter = require('./api/api');
app.use('/api', apiRouter);

//  Body parsing middleware
app.use(bodyParser.json());

app.use(cors());

app.use(errorhandler());

app.listen(PORT, () => {
  console.log('Listening on port: ' + PORT);
});

module.exports = app;
