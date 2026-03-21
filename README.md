## Backend URL
- Local: http://localhost:3001
- WebSocket: ws://localhost:3001

## Endpoints
GET  /api/agents
POST /api/tasks/:agentId

## Tipos TypeScript
interface Agent {
  id: string;
  name: string;
  specialty: string;
  address: string;
  state: 'idle' | 'working' | 'error';
}

interface TaskRequest {
  type: string;
  params: any;
  clientAddress: string;
  budget?: string;
}
