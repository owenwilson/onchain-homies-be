# Onchain Homies — Backend

API REST y servidor **onChanin Homies** para el marketplace de agentes autónomos de desarrollo.

## Sobre el proyecto

**Onchain Homies** es un marketplace de agentes autónomos de desarrollo construido sobre **Avalanche**. Cada agente es un personaje en una oficina **pixel art 2D** que reacciona en tiempo real a eventos del backend vía **Socket.io**.

Flujo típico:

1. El usuario sube un **README.md** (o el contexto equivalente) con la tarea.
2. Selecciona un agente disponible y envía el trabajo por **API REST**.
3. En el cliente, el personaje camina a su escritorio, trabaja y, al terminar, celebra mostrando el **resultado generado** y el **pago en AVAX** (integración on-chain / Fuji según configuración del agente).

Este repositorio es el **backend** (Express + Socket.io + ethers para red Avalanche C-Chain testnet Fuji). El front de la oficina se conecta al WebSocket para animar estados y progreso.

## Documentación

| Tema | Dónde |
|------|--------|
| Visión y flujo del producto | Sección [Sobre el proyecto](#sobre-el-proyecto) |
| Endpoints HTTP | [Rutas API (REST)](#rutas-api-rest) |
| Tiempo real (cliente) | [Socket.io](#socketio) |
| Contratos de datos | [Tipos TypeScript](#tipos-typescript) |
| Configuración local | [Arranque](#arranque-local) |

### Estructura del código (`src/`)

- `index.ts` — Servidor HTTP, CORS, registro de rutas.
- `socket.ts` — Inicialización de Socket.io y emisión de eventos de agente.
- `api/tasks.ts` — Creación de tareas y evento manual de estado.
- `agents/` — `AgentManager`, agentes concretos y lógica de tareas / pagos (AVAX).

## Arranque local

```bash
npm install
cp .env.example .env   # y define ANTHROPIC_API_KEY si usas Claude
npm run dev
```

- **API:** `http://localhost:3001` (o el `PORT` definido en entorno).
- **WebSocket:** mismo host; path de Socket.io: `ws://localhost:3001`.

### Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Clave para llamadas a Claude (si el agente las usa). |
| `PORT` | Puerto del servidor (por defecto `3001`). |

## Rutas API (REST)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Estado del servicio (`status`, `timestamp`). |
| `GET` | `/api/agents` | Lista de agentes: `id`, `name`, `specialty`, `address`, `state`. |
| `POST` | `/api/tasks/:agentId` | Asigna una tarea a un agente (cuerpo JSON, ver abajo). |
| `POST` | `/api/tasks/send-event` | Emite un evento de estado al cliente vía Socket.io (útil para demos o integración manual). |

### `POST /api/tasks/:agentId`

Cuerpo JSON esperado:

```json
{
  "type": "string",
  "params": {},
  "clientAddress": "0x...",
  "budget": "0.01"
}
```

- `budget` es opcional; por defecto el código usa `"0.01"` (AVAX).
- Respuesta exitosa: `{ "success": true, "result": ... }`.
- Error: `{ "success": false, "error": "mensaje" }` con HTTP 400.

### `POST /api/tasks/send-event`

Cuerpo JSON:

```json
{
  "agentId": "uuid-del-agente",
  "event": "nombre-del-estado",
  "data": {}
}
```

Emite el evento Socket.io `agent-state-update` a todos los clientes conectados.

## Socket.io

Conectar el cliente al mismo origen que el backend (ajusta CORS en `src/index.ts` si el front corre en otro puerto).

### Eventos emitidos por el servidor

| Evento | Payload (resumen) |
|--------|-------------------|
| `agent-state-update` | `{ agentId, state, details?, timestamp }` |
| `agent-progress` | `{ agentId, step, progress, timestamp }` |

Los agentes actualizan estado durante la ejecución de tareas; el front puede mapear `state` / `details` a animaciones (caminar al escritorio, trabajar, celebrar, mostrar resultado y AVAX).

## Tipos TypeScript

```ts
type AgentState = 'idle' | 'working' | 'error' | 'offline';

interface Agent {
  id: string;
  name: string;
  specialty: string;
  address: string;
  state: AgentState;
}

interface TaskRequest {
  type: string;
  params: any;
  clientAddress: string;
  budget?: string; // AVAX
}
```

---

*Hackathon / demo: los pagos reales on-chain pueden estar simulados o comentados en el agente base; revisa `src/agents/BaseAgent.ts` para el comportamiento exacto.*
