import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { AgentManager } from './agents/AgentManager';
import taskRoutes from './api/tasks';
import { initSocket } from './socket';
import dotenv from 'dotenv';

dotenv.config();

// const agentManager = new AgentManager();
const agentManager = AgentManager.getInstance();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "http://localhost:5173", credentials: true }
});

initSocket(io);

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/agents', (req, res) => {
    res.json(agentManager.getAgents());
});

io.on('connection', (socket) => {
    console.log('🟢 Client connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('🔴 Client disconnected:', socket.id);
    });
});

app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('🤖 Agents loaded:', agentManager.getAgents().map(a => a.name));
});