const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.run('DROP TABLE IF EXISTS Artist');
  db.run('CREATE TABLE IF NOT EXISTS `Artist` (' +
  '`id` INTEGER NOT NULL, ' +
  '`name` TEXT NOT NULL, ' +
  '`date_of_birth` TEXT NOT NULL, ' +
  '`biography` TEXT NOT NULL, ' +
  '`is_currently_employed` INTEGER NOT NULL DEFAULT 1, ' +
  'PRIMARY KEY(`id`) )');

  db.run('DROP TABLE IF EXISTS Series');
  db.run('CREATE TABLE IF NOT EXISTS `Series` (' +
  '`id` INTEGER NOT NULL, ' +
  '`name` TEXT NOT NULL, ' +
  '`description` TEXT NOT NULL, ' +
  'PRIMARY KEY(`id`) )');

  db.run('DROP TABLE IF EXISTS Issue');
  db.run('CREATE TABLE IF NOT EXISTS `Issue` (' +
  '`id` INTEGER NOT NULL, ' +
  '`name` TEXT NOT NULL, ' +
  '`issue_number` TEXT NOT NULL, ' +
  '`publication_date` TEXT NOT NULL, ' +
  '`artist_id` INTEGER NOT NULL, ' +
  '`series_id` INTEGER NOT NULL, ' +
  'PRIMARY KEY(`id`), ' +
  'FOREIGN KEY(`series_id`) REFERENCES `Series`(`id`)' +
  'FOREIGN KEY(`series_id`) REFERENCES `Series`(`id`) )');
});
