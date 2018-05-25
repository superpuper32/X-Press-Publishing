const express =require('express');
const issuesRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


issuesRouter.param('issueId', (req, res, next, issueId) => {
  db.get('SELECT * FROM Issue WHERE Issue.id = $issueId', {
    $issueId: issueId
  }, (err, issue) => {
    if (err) {
      next(err);
    } else if (issue) {
      req.issue = issue;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

issuesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Issue WHERE Issue.series_id = $seriesId', {
    $seriesId: req.params.seriesId
  }, (err, issue) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({issues: issue});
    }
  });
});

const validateIssues = (req, res, next) => {
  const issueToValidate = req.body.issue;
  if (!issueToValidate.name || !issueToValidate.issueNumber
    || !issueToValidate.publicationDate) {
      return res.sendStatus(400);
    }
    next();
};

issuesRouter.post('/', validateIssues, (req, res, next) => {
  const issueToCreate = req.body.issue;
  db.get('SELECT * FROM Artist WHERE Artist.id = $artistId', {
    $artistId: issueToCreate.artistId
  }, (err, artist) => {
    if (err) {
      next(err);
    } else {
      if (!artist) {
        return res.sendStatus(400);
      }

      db.run('INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id)' +
    'VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)', {
      $name: issueToCreate.name,
      $issueNumber: issueToCreate.issueNumber,
      $publicationDate: issueToCreate.publicationDate,
      $artistId: issueToCreate.artistId,
      $seriesId: req.params.seriesId
    }, function(err) {
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM Issue WHERE Issue.id = ${this.lastID}`,
        (err, issue) => {
          res.status(201).json({issue: issue});
        });
      }
    });
    }
  });
});

issuesRouter.put('/:issueId', validateIssues, (req, res, next) => {
  const issueToUpdate = req.body.issue;
  db.get('SELECT * FROM Artist WHERE Artist.id = $artistId', {
    $artistId: issueToUpdate.artistId
  }, (err, artist) => {
    if (err) {
      next(err);
    } else {
      if (!artist) {
        res.sendStatus(400);
      }

      db.run('UPDATE Issue SET name = $name, issue_number = $issueNumber, ' +
      'publication_date = $publicationDate, artist_id = $artistId ' +
      'WHERE Issue.id = $issueId', {
        $name: issueToUpdate.name,
        $issueNumber: issueToUpdate.issueNumber,
        $publicationDate: issueToUpdate.publicationDate,
        $artistId: issueToUpdate.artistId,
        $issueId: req.params.issueId
      }, function(err) {
        if (err) {
          next(err);
        } else {
          db.get(`SELECT * FROM Issue WHERE Issue.id = ${req.params.issueId}`,
          (err, issue) => {
            res.status(200).json({issue: issue});
          });
        }
      });
    }
  });
});

issuesRouter.delete('/:issueId', (req, res, next) => {
  db.run('DELETE FROM Issue WHERE Issue.id = $issueId', {
    $issueId: req.params.issueId
  }, (err) => {
    if (err) {
      next(err);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = issuesRouter;
