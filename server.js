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

app.post('/api/products', (req, res) => {
  const { sku, name } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO products (sku, name, status) VALUES (?, ?, "Available")');
    const info = stmt.run(sku, name);
    res.json({ id: info.lastInsertRowid, sku, name, status: 'Available' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    const info = stmt.run(req.params.id);
    res.json({ deleted: info.changes });
  } catch (err) {
    res.status(400).json({ error: err.message });
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
