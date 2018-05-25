const express = require('express');
const artistsRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

artistsRouter.param('artistId', (req, res, next, artistId) => {
  db.get('SELECT * FROM Artist WHERE Artist.id = $artistId', {
    $artistId: artistId
  }, (err, artist) => {
    if (err) {
      next(err);
    } else if (artist) {
      req.artist = artist;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

artistsRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Artist WHERE Artist.is_currently_employed = 1', (err, artists) => {
    if (err) {
      next(err);
    }
    res.status(200).json({artists: artists});
  });
});

artistsRouter.get('/:artistId', (req, res, next) => {
  res.status(200).json({artist: req.artist});
});

const validateArtists = (req, res, next) => {
  const artistToValidate = req.body.artist;
  if (!artistToValidate.name || !artistToValidate.dateOfBirth || !artistToValidate.biography) {
    return res.sendStatus(400);
  }
  next();
};

artistsRouter.post('/', validateArtists, (req, res, next) => {
  const artistToCreate = req.body.artist;
  const isCurEmployed = artistToCreate.isCurrentlyEmployed === 0 ? 0 : 1;
  db.run('INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed)' +
    ' VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)', {
    $name: artistToCreate.name,
    $dateOfBirth: artistToCreate.dateOfBirth,
    $biography: artistToCreate.biography,
    $isCurrentlyEmployed: isCurEmployed
  }, function(err) {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Artist WHERE Artist.id = ${this.lastID}`,
        (err, artist) => {
          res.status(201).json({artist: artist});
      });
    }
  });
});

artistsRouter.put('/:artistId', validateArtists, (req, res, next) => {
  const artistToUpdate = req.body.artist;
  const isCurEmployed = artistToUpdate.isCurrentlyEmployed === 0 ? 0 : 1;

  db.run('UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, ' +
  'biography = $biography, is_currently_employed = $isCurrentlyEmployed ' +
  'WHERE Artist.id = $artistId', {
    $name: artistToUpdate.name,
    $dateOfBirth: artistToUpdate.dateOfBirth,
    $biography: artistToUpdate.biography,
    $isCurrentlyEmployed: isCurEmployed,
    $artistId: req.params.artistId
  }, (err) => {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Artist WHERE Artist.id = ${req.params.artistId}`,
        (err, artist) => {
          res.status(200).json({artist: artist});
      });
    }
  });
});

artistsRouter.delete('/:artistId', (req, res, next) => {
  db.run('UPDATE Artist SET is_currently_employed = 0 WHERE Artist.id = $artistId', {
    $artistId: req.params.artistId
    }, (err) => {
      if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Artist WHERE Artist.id = ${req.params.artistId}`,
        (err, artist) => {
          res.status(200).json({artist: artist});
      });
    }
  });
});

module.exports = artistsRouter;
