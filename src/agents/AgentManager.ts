import { BaseAgent } from './BaseAgent';
import { FrontendAgent } from './FrontendAgent';
import { Task } from './BaseAgent';
import { emitAgentState } from '../socket';

export class AgentManager {
    private static instance: AgentManager;
    private agents: Map<string, BaseAgent> = new Map();

    private constructor() {
        // Crear agentes demo
        const frontend = new FrontendAgent('Alex');
        this.agents.set(frontend.id, frontend);

        console.log(`✅ Demo agents ready:`);
        console.log(`   - ${frontend.name} (${frontend.specialty}) | ${frontend.getAddress()}`);
    }

    static getInstance(): AgentManager {
        if (!AgentManager.instance) {
            AgentManager.instance = new AgentManager();
        }
        return AgentManager.instance;
    }

    getAgents() {
        return Array.from(this.agents.values()).map(a => ({
            id: a.id,
            name: a.name,
            specialty: a.specialty,
            address: a.getAddress(),
            state: a.state
        }));
    }

    async assignTask(agentId: string, task: Task): Promise<any> {
        const agent = this.agents.get(agentId);
        if (!agent) throw new Error(`Agent ${agentId} not found`);

        const result = await agent.executeTask(task);
        emitAgentState(agentId, 'idle', { result: 'completed' });
        return result;
    }
}