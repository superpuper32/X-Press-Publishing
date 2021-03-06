const express = require('express');
const seriesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const issuesRouter =require('./issues.js');

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
  db.get('SELECT * FROM Series WHERE Series.id = $seriesId', {
    $seriesId: seriesId
  }, (err, serie) => {
    if (err) {
      next(err);
    } else if (serie) {
      req.serie = serie;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

seriesRouter.use('/:seriesId/issues', issuesRouter);

seriesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Series', (err, series) => {
    if (err) {
      next(err);
    }
    res.status(200).json({series: series});
  });
});

seriesRouter.get('/:seriesId', (req, res, next) => {
  res.status(200).json({series: req.serie});
});

const validateSeries = (req, res, next) => {
  const serieToValidate = req.body.series;
  if (!serieToValidate.name || !serieToValidate.description) {
    return res.sendStatus(400);
  }
  next();
};

seriesRouter.post('/', validateSeries, (req, res, next) => {
  const serieToCreate = req.body.series;
  db.run('INSERT INTO Series (name, description) VALUES ($name, $description)', {
    $name: serieToCreate.name,
    $description: serieToCreate.description
  }, function(err) {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Series WHERE Series.id = ${this.lastID}`,
        (err, serie) => {
          res.status(201).json({series: serie});
      });
    }
  });
});

seriesRouter.put('/:seriesId', validateSeries, (req, res, next) => {
  const serieToUpdate = req.body.series;
  db.run('UPDATE Series SET name = $name, ' +
  'description = $description WHERE Series.id = $seriesId', {
    $name: serieToUpdate.name,
    $description: serieToUpdate.description,
    $seriesId: req.params.seriesId
  }, (err) => {
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Series WHERE Series.id = ${req.params.seriesId}`,
      (err, serie) => {
        res.status(200).send({series: serie});
      });
    }
  });
});

seriesRouter.delete('/:seriesId', (req, res, next) => {
  db.get('SELECT * FROM Issue WHERE Issue.series_id = $seriesId', {
    $seriesId: req.params.seriesId
  }, (err, issue) => {
    if (err) {
      next(err);
    } else if (issue) {
      res.sendStatus(400);
    } else {
      db.run('DELETE FROM Series WHERE Series.id = $seriesId', {
        $seriesId: req.params.seriesId
      }, (err) => {
        if (err) {
          next(err);
        } else {
          res.sendStatus(204);
        }
      });
    }
  });
});

module.exports = seriesRouter;
