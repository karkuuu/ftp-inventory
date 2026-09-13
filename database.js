const Database = require('better-sqlite3');
const db = new Database('./inventory.db');

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'Available'
  );

  CREATE TABLE IF NOT EXISTS logbook (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    borrower TEXT NOT NULL,
    date_borrowed TEXT NOT NULL,
    date_due TEXT NOT NULL
  );
`);

module.exports = db;
