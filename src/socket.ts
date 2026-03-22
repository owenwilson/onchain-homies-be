import { Server } from 'socket.io';

let io: Server;

export const initSocket = (socketServer: Server) => {
    io = socketServer;
    console.log('🔌 Socket.io initialized');

    io.on('connection', (socket) => {
        console.log('🟢 WebSocket client connected:', socket.id);

        socket.on('disconnect', () => {
            console.log('🔴 WebSocket client disconnected:', socket.id);
        });
    });
};

export const emitAgentState = (agentId: string, state: string, details?: any) => {
    if (io) {
        io.emit('agent-state-update', { agentId, state, details, timestamp: Date.now() });
        // console.log(`📡 Emitted: ${agentId} -> ${state}`);
        console.log(`📡 WebSocket emitted: ${agentId} -> ${state}`, details);
    } else {
        console.log('⚠️ WebSocket not initialized');
    }
};

// progreso del agente
export const emitAgentProgress = (agentId: string, step: string, progress: number) => {
    if (io) {
        io.emit('agent-progress', { agentId, step, progress, timestamp: Date.now() });
    }
};
