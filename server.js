const express = require('express');
const db = require('./database');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// --- MASTER INVENTORY ROUTES ---

app.get('/api/products', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM products').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/items', (req, res) => {
  // Ensure field names match what your frontend JSON payload sends
  const { item_id, name } = req.body;

  if (!item_id || !name) {
    return res.status(400).json({ error: "Item ID and Item Name are required." });
  }

  try {
    // Check if the item_id already exists in SQLite before inserting
    const existing = db.prepare('SELECT * FROM inventory WHERE item_id = ?').get(item_id);
    if (existing) {
      return res.status(400).json({ error: "Item ID must be unique" });
    }

    const stmt = db.prepare('INSERT INTO inventory (item_id, name, status) VALUES (?, ?, ?)');
    stmt.run(item_id, name, 'Available');

    res.json({ success: true, item_id, name, status: 'Available' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/products/:id/status', (req, res) => {
  const { status } = req.body;
  try {
    const stmt = db.prepare('UPDATE products SET status = ? WHERE id = ?');
    const info = stmt.run(status, req.params.id);
    res.json({ updated: info.changes, status });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- LOGBOOK ROUTES ---

app.get('/api/logbook', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM logbook ORDER BY id DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/logbook', (req, res) => {
  const { sku, name, borrower, date_borrowed, date_due } = req.body;
  try {
    const insertStmt = db.prepare('INSERT INTO logbook (sku, name, borrower, date_borrowed, date_due) VALUES (?, ?, ?, ?, ?)');
    const info = insertStmt.run(sku, name, borrower, date_borrowed, date_due);

    const updateStmt = db.prepare('UPDATE products SET status = "Not Available" WHERE sku = ?');
    updateStmt.run(sku);

    res.json({ id: info.lastInsertRowid, sku, name, borrower, date_borrowed, date_due });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
