const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = 'Divine2026.';
const DB_PATH = path.join(__dirname, 'data', 'framd.db');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

// ─── DATABASE SETUP ───
let db;
async function initDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      service TEXT,
      budget TEXT,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      read INTEGER DEFAULT 0
    )
  `);
  saveDB();
  console.log('✅ Database ready');
}

function saveDB() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// ─── API ROUTES ───

// Submit inquiry
app.post('/api/inquiry', (req, res) => {
  const { name, email, service, budget, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required.' });
  }

  try {
    db.run(
      `INSERT INTO inquiries (name, email, service, budget, message) VALUES (?, ?, ?, ?, ?)`,
      [name, email, service || '', budget || '', message]
    );
    saveDB();
    res.json({ success: true, message: "Inquiry received. Divine will be in touch soon." });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save inquiry.' });
  }
});

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: 'framd-admin-2026' });
  } else {
    res.status(401).json({ error: 'Wrong password.' });
  }
});

// Get all inquiries (protected)
app.get('/api/admin/inquiries', (req, res) => {
  const auth = req.headers.authorization;
  if (auth !== 'Bearer framd-admin-2026') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const result = db.exec(`SELECT * FROM inquiries ORDER BY created_at DESC`);
    if (!result.length) return res.json([]);
    const cols = result[0].columns;
    const rows = result[0].values.map(row => {
      const obj = {};
      cols.forEach((col, i) => obj[col] = row[i]);
      return obj;
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inquiries.' });
  }
});

// Mark as read
app.patch('/api/admin/inquiries/:id/read', (req, res) => {
  const auth = req.headers.authorization;
  if (auth !== 'Bearer framd-admin-2026') return res.status(401).json({ error: 'Unauthorized' });
  db.run(`UPDATE inquiries SET read = 1 WHERE id = ?`, [req.params.id]);
  saveDB();
  res.json({ success: true });
});

// Delete inquiry
app.delete('/api/admin/inquiries/:id', (req, res) => {
  const auth = req.headers.authorization;
  if (auth !== 'Bearer framd-admin-2026') return res.status(401).json({ error: 'Unauthorized' });
  db.run(`DELETE FROM inquiries WHERE id = ?`, [req.params.id]);
  saveDB();
  res.json({ success: true });
});

// Stats
app.get('/api/admin/stats', (req, res) => {
  const auth = req.headers.authorization;
  if (auth !== 'Bearer framd-admin-2026') return res.status(401).json({ error: 'Unauthorized' });
  const total = db.exec(`SELECT COUNT(*) as count FROM inquiries`)[0]?.values[0][0] || 0;
  const unread = db.exec(`SELECT COUNT(*) as count FROM inquiries WHERE read = 0`)[0]?.values[0][0] || 0;
  res.json({ total, unread });
});

// Serve main site
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

// Start
initDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Framd server running on http://localhost:${PORT}`));
});
