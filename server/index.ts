import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { JSONFilePreset } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Data {
  sessions: Record<string, any>;
  history: Record<string, any>;
}

const defaultData: Data = { sessions: {}, history: {} };
const db = await JSONFilePreset<Data>('db.json', defaultData);

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  }
});

// Serve static files from the dist directory (after build)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// API Endpoints
app.get('/api/:collection/:id', async (req, res) => {
  const { collection, id } = req.params;
  const data = db.data as any;
  if (data[collection] && data[collection][id]) {
    res.json(data[collection][id]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.post('/api/:collection/:id', async (req, res) => {
  const { collection, id } = req.params;
  const body = req.body;
  
  await db.update((data: any) => {
    if (!data[collection]) data[collection] = {};
    data[collection][id] = { ...body, id };
  });

  io.to(`${collection}/${id}`).emit('change', db.data[collection as keyof Data][id]);
  res.json(db.data[collection as keyof Data][id]);
});

app.patch('/api/:collection/:id', async (req, res) => {
  const { collection, id } = req.params;
  const body = req.body;

  await db.update((data: any) => {
    if (!data[collection]) data[collection] = {};
    const existing = data[collection][id] || { id };
    
    // Support nested updates for ratings and emojis
    for (const key in body) {
      if (key.includes('.')) {
        const [parent, child] = key.split('.');
        if (!existing[parent]) existing[parent] = {};
        existing[parent][child] = body[key];
      } else {
        existing[key] = body[key];
      }
    }
    data[collection][id] = existing;
  });

  io.to(`${collection}/${id}`).emit('change', db.data[collection as keyof Data][id]);
  res.json(db.data[collection as keyof Data][id]);
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  socket.on('subscribe', (topic) => {
    socket.join(topic);
    const [collection, id] = topic.split('/');
    const data = db.data as any;
    if (data[collection] && data[collection][id]) {
      socket.emit('change', data[collection][id]);
    }
  });

  socket.on('unsubscribe', (topic) => {
    socket.leave(topic);
  });
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

import os from 'os';

const getLocalIp = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

const PORT = process.env.PORT || 3001;
const LOCAL_IP = getLocalIp();

httpServer.listen(PORT, () => {
  console.log(`Server running locally: http://localhost:${PORT}`);
  console.log(`Server running on network: http://${LOCAL_IP}:${PORT}`);
  console.log(`\nIMPORTANT: Use http://${LOCAL_IP}:${PORT} if connecting from other devices!`);
});
