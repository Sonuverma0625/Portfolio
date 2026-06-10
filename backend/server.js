/**
 * Portfolio Backend API Server
 * Express.js REST API with JSON flat-file database
 * 
 * Run: npm install && npm start
 * Dev: npm run dev (requires nodemon)
 * API runs at: http://localhost:3002
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3002;
const DB_PATH = path.join(__dirname, 'db.json');

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3002', 'null', 'file://'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// Request logger middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ─── DB Helpers ────────────────────────────────────────────────────────────────
function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB:', err.message);
    return null;
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing DB:', err.message);
    return false;
  }
}

// ─── Routes ────────────────────────────────────────────────────────────────────

// Root: API info
app.get('/api', (req, res) => {
  res.json({
    name: 'Portfolio API',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      'GET  /api/portfolio',
      'GET  /api/projects',
      'GET  /api/projects/:id',
      'GET  /api/skills',
      'GET  /api/certificates',
      'GET  /api/experience',
      'POST /api/contact',
      'GET  /api/messages  (admin)',
      'DELETE /api/messages/:id  (admin)',
      'GET  /api/analytics',
      'POST /api/analytics/visit'
    ]
  });
});

// ── Portfolio Info ──────────────────────────────────────────────────────────────
app.get('/api/portfolio', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: 'Database error' });
  res.json({ success: true, data: db.portfolio });
});

// ── Projects ───────────────────────────────────────────────────────────────────
app.get('/api/projects', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: 'Database error' });

  let projects = db.projects;

  // Filter by featured
  if (req.query.featured === 'true') {
    projects = projects.filter(p => p.featured);
  }

  // Filter by tag
  if (req.query.tag) {
    projects = projects.filter(p =>
      p.tags.some(t => t.toLowerCase() === req.query.tag.toLowerCase())
    );
  }

  res.json({ success: true, count: projects.length, data: projects });
});

app.get('/api/projects/:id', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: 'Database error' });

  const project = db.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  res.json({ success: true, data: project });
});

// ── Skills ─────────────────────────────────────────────────────────────────────
app.get('/api/skills', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: 'Database error' });
  res.json({ success: true, data: db.skills });
});

// ── Certificates ───────────────────────────────────────────────────────────────
app.get('/api/certificates', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: 'Database error' });
  res.json({ success: true, data: db.certificates });
});

// ── Experience ─────────────────────────────────────────────────────────────────
app.get('/api/experience', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: 'Database error' });
  res.json({ success: true, data: db.experience });
});

// ── Contact Form ───────────────────────────────────────────────────────────────
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({
      error: 'Validation failed',
      details: 'Name, email, and message are required.'
    });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  const db = readDB();
  if (!db) return res.status(500).json({ error: 'Database error' });

  const newMessage = {
    id: uuidv4(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: (subject || 'No Subject').trim(),
    message: message.trim(),
    read: false,
    created_at: new Date().toISOString()
  };

  db.messages.push(newMessage);
  db.analytics.contact_submissions += 1;
  db.analytics.last_updated = new Date().toISOString();

  const saved = writeDB(db);
  if (!saved) return res.status(500).json({ error: 'Failed to save message' });

  console.log(`✉️  New contact from: ${name} <${email}>`);

  res.status(201).json({
    success: true,
    message: 'Message received! I will get back to you soon.',
    id: newMessage.id
  });
});

// ── Messages (Admin) ───────────────────────────────────────────────────────────
app.get('/api/messages', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: 'Database error' });

  // Sort newest first
  const sorted = [...db.messages].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  res.json({ success: true, count: sorted.length, data: sorted });
});

app.put('/api/messages/:id/read', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: 'Database error' });

  const msg = db.messages.find(m => m.id === req.params.id);
  if (!msg) return res.status(404).json({ error: 'Message not found' });

  msg.read = true;
  writeDB(db);
  res.json({ success: true, data: msg });
});

app.delete('/api/messages/:id', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: 'Database error' });

  const idx = db.messages.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Message not found' });

  const deleted = db.messages.splice(idx, 1);
  writeDB(db);
  res.json({ success: true, message: 'Message deleted', data: deleted[0] });
});

// ── Analytics ──────────────────────────────────────────────────────────────────
app.get('/api/analytics', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: 'Database error' });
  res.json({ success: true, data: db.analytics });
});

app.post('/api/analytics/visit', (req, res) => {
  const db = readDB();
  if (!db) return res.status(500).json({ error: 'Database error' });

  db.analytics.total_visits += 1;
  db.analytics.last_updated = new Date().toISOString();
  writeDB(db);

  res.json({ success: true, total_visits: db.analytics.total_visits });
});

// ── Catch-all: serve index.html for frontend routing ──────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ─── Error Handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n🚀 Portfolio Backend running!');
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   API:     http://localhost:${PORT}/api`);
  console.log(`   Frontend served at root /`);
  console.log('\n📡 Available endpoints:');
  console.log('   GET  /api/portfolio');
  console.log('   GET  /api/projects');
  console.log('   GET  /api/skills');
  console.log('   GET  /api/certificates');
  console.log('   GET  /api/experience');
  console.log('   POST /api/contact');
  console.log('   GET  /api/messages');
  console.log('   GET  /api/analytics\n');
});

module.exports = app;
