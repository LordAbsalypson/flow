import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Database from 'better-sqlite3';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // We proxy from Vite anyway
  }
});

app.use(cors());
app.use(express.json());

const db = new Database('local_database.sqlite');
db.pragma('journal_mode = WAL');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    currentHistoryId TEXT
  );
  
  CREATE TABLE IF NOT EXISTS history (
    id TEXT PRIMARY KEY,
    sessionId TEXT,
    videoId TEXT,
    title TEXT,
    artist TEXT,
    timestamp TEXT,
    ratings TEXT, -- JSON map
    emojis TEXT -- JSON map
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    type TEXT,
    text TEXT,
    timestamp TEXT,
    source TEXT
  );
`);

const statements = {
  getSession: db.prepare('SELECT * FROM sessions WHERE id = ?'),
  upsertSession: db.prepare('INSERT INTO sessions (id, currentHistoryId) VALUES (@id, @currentHistoryId) ON CONFLICT(id) DO UPDATE SET currentHistoryId = @currentHistoryId'),
  
  getHistoryCount: db.prepare('SELECT COUNT(*) as c FROM history'),
  getHistoryPage: db.prepare('SELECT * FROM history ORDER BY timestamp DESC LIMIT ? OFFSET ?'),
  getHistorySingle: db.prepare('SELECT * FROM history WHERE id = ?'),
  insertHistory: db.prepare('INSERT INTO history (id, sessionId, videoId, title, artist, timestamp, ratings, emojis) VALUES (@id, @sessionId, @videoId, @title, @artist, @timestamp, @ratings, @emojis)'),
  updateHistoryRatings: db.prepare('UPDATE history SET ratings = ? WHERE id = ?'),
  updateHistoryEmojis: db.prepare('UPDATE history SET emojis = ? WHERE id = ?'),

  insertFeedback: db.prepare('INSERT INTO feedback (id, type, text, timestamp, source) VALUES (@id, @type, @text, @timestamp, @source)'),
};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// REST ENDPOINTS //

app.get('/api/sessions/:id', (req, res) => {
  const session = statements.getSession.get(req.params.id);
  res.json(session || {});
});

app.post('/api/sessions', (req, res) => {
  const { id, currentHistoryId } = req.body;
  statements.upsertSession.run({ id, currentHistoryId });
  io.emit('sessionUpdated', { id, currentHistoryId });
  res.json({ success: true });
});

app.get('/api/history', (req, res) => {
  // Support pagination
  const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
  const offset = parseInt(req.query.offset as string) || 0;
  
  const rows = statements.getHistoryPage.all(limit, offset);
  
  // Parse JSON fields
  const results = rows.map((row: any) => ({
    ...row,
    ratings: JSON.parse(row.ratings || '{}'),
    emojis: JSON.parse(row.emojis || '{}')
  }));
  
  const countRow = statements.getHistoryCount.get() as any;
  const count = countRow ? countRow.c : 0;
  
  res.json({ results, totalCount: count });
});

app.get('/api/history/:id', (req, res) => {
  const row = statements.getHistorySingle.get(req.params.id) as any;
  if (!row) return res.status(404).json({ error: 'not found' });
  
  res.json({
    ...row,
    ratings: JSON.parse(row.ratings || '{}'),
    emojis: JSON.parse(row.emojis || '{}')
  });
});

app.post('/api/history', (req, res) => {
  const { id, sessionId, videoId, title, artist, timestamp } = req.body;
  statements.insertHistory.run({
    id,
    sessionId,
    videoId,
    title,
    artist,
    timestamp,
    ratings: '{}',
    emojis: '{}'
  });
  
  res.json({ success: true, id });
});

app.put('/api/history/:id/vote', (req, res) => {
  const { userId, rating, emoji } = req.body;
  const id = req.params.id;
  
  try {
    const row = statements.getHistorySingle.get(id) as any;
    if (!row) return res.status(404).json({ error: 'not found' });
    
    let updated = false;
    
    if (rating !== undefined) {
      const ratings = JSON.parse(row.ratings || '{}');
      ratings[userId] = rating;
      statements.updateHistoryRatings.run(JSON.stringify(ratings), id);
      updated = true;
    }
    
    if (emoji !== undefined) {
      const emojis = JSON.parse(row.emojis || '{}');
      emojis[userId] = emoji;
      statements.updateHistoryEmojis.run(JSON.stringify(emojis), id);
      updated = true;
    }
    
    if (updated) {
      io.emit('historyUpdated', { id });
    }
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/feedback', (req, res) => {
  const { id, type, text, timestamp, source } = req.body;
  statements.insertFeedback.run({ id, type, text, timestamp, source });
  res.json({ success: true, id });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Local Backend running on port ${PORT}`);
});
