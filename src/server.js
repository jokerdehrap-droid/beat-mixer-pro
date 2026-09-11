import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import beatGeneratorRoutes from './routes/beatGenerator.js';
import audioProcessingRoutes from './routes/audioProcessing.js';
import remixerRoutes from './routes/remixer.js';
import vocalMasteringRoutes from './routes/vocalMastering.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/beat', beatGeneratorRoutes);
app.use('/api/audio', audioProcessingRoutes);
app.use('/api/remix', remixerRoutes);
app.use('/api/mastering', vocalMasteringRoutes);

// WebSocket connections for real-time audio processing
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('start-beat-generation', (data) => {
    console.log('Beat generation started:', data);
    socket.emit('beat-generation-started', { status: 'processing' });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🎵 Beat Mixer Pro running on http://localhost:${PORT}`);
});

export { app, io };
