const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./inventory.db', (err) => {
  if (err) console.error('Database connection error:', err.message);
  else console.log('Connected to SQLite database.');
});

db.serialize(() => {
  // Master Inventory Table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'Available'
    )
  `);

  // Borrow Logbook Table
  db.run(`
    CREATE TABLE IF NOT EXISTS logbook (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sku TEXT NOT NULL,
      name TEXT NOT NULL,
      borrower TEXT NOT NULL,
      date_borrowed TEXT NOT NULL,
      date_due TEXT NOT NULL
    )
  `);
});

module.exports = db;