const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');
const filename = process.env.DB_PATH || path.join(__dirname, 'meditrack.db');
fs.mkdirSync(path.dirname(filename), { recursive: true });
const db = new DatabaseSync(filename);
db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
module.exports = db;
