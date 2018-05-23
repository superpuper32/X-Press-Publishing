const express = require('express');
const artistsRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

artistsRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Artist WHERE Artist.is_currently_employed = 1', (err, artists) => {
    if (err) {
      next(err);
    }
    res.status(200).send({artists: artists});
  });
});

artistsRouter.get('/:artistId', (req, res, next) => {
  db.get('SELECT * FROM Artist WHERE Artist.id = $artistId', {
    $artistId: req.params.artistId
  }, (err, artist) => {
    if (err) {
      next(err);
    } else if (artist) {
      res.status(200).send({artist: artist});
    } else {
      res.sendStatus(404);
    }
  });
});

module.exports = artistsRouter;
