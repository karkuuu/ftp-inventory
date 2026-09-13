const express = require('express');
const db = require('./database');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// --- MASTER INVENTORY ROUTES ---

// Get all inventory items
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add new item to Master Inventory
app.post('/api/products', (req, res) => {
  const { sku, name } = req.body;
  const sql = 'INSERT INTO products (sku, name, status) VALUES (?, ?, "Available")';
  db.run(sql, [sku, name], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ id: this.lastID, sku, name, status: 'Available' });
  });
});

// Delete item from Master Inventory
app.delete('/api/products/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// Toggle Item Status (Available <-> Not Available)
app.patch('/api/products/:id/status', (req, res) => {
  const { status } = req.body;
  db.run('UPDATE products SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ updated: this.changes, status });
  });
});

// --- LOGBOOK ROUTES ---

// Get all logbook transactions
app.get('/api/logbook', (req, res) => {
  db.all('SELECT * FROM logbook ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create Borrow Transaction & automatically mark item "Not Available"
app.post('/api/logbook', (req, res) => {
  const { sku, name, borrower, date_borrowed, date_due } = req.body;

  const sql = 'INSERT INTO logbook (sku, name, borrower, date_borrowed, date_due) VALUES (?, ?, ?, ?, ?)';
  db.run(sql, [sku, name, borrower, date_borrowed, date_due], function(err) {
    if (err) return res.status(400).json({ error: err.message });

    // Mark item as 'Not Available' in the Master Inventory automatically
    db.run('UPDATE products SET status = "Not Available" WHERE sku = ?', [sku]);

    res.json({ id: this.lastID, sku, name, borrower, date_borrowed, date_due });
  });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));