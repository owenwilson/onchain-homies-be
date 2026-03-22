import { Router } from 'express';
import { AgentManager } from '../agents/AgentManager';
import { Task } from '../agents/BaseAgent';
import { emitAgentState } from '../socket';

const router = Router();
const agentManager = AgentManager.getInstance();


router.post('/send-event', async (req, res) => {
    try {
        console.log('req, bod', req.body)
        const { agentId, event, data } = req.body;
        const result = await emitAgentState(agentId, event, data);
        res.json({ success: true, result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.post('/:agentId', async (req, res) => {
    try {
        const { agentId } = req.params;
        const { type, params, budget, clientAddress } = req.body;

        const task: Task = {
            id: crypto.randomUUID(),
            type,
            params,
            budget: budget || '0.01',
            clientAddress
        };

        const result = await agentManager.assignTask(agentId, task);
        res.json({ success: true, result });
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
});

export default router;