import { BaseAgent, Task } from './BaseAgent';
import { executeClaudeTask } from '../services/claudeService';
import { emitAgentState } from '../socket';
import fs from 'fs';
import path from 'path';


export class FrontendAgent extends BaseAgent {
    constructor(name: string, privateKey?: string) {
        super(name, 'frontend', privateKey);
    }

    protected async runTask(task: Task): Promise<any> {
        // Simular generación de código React
        const componentName = task.params.componentName || 'Button';

        emitAgentState(this.id, 'working', {
            step: 'Generating code with Claude AI',
            progress: 30
        });

        const zipBuffer = await executeClaudeTask({
            description: task.params.description,
            framework: task.params.framework || 'react',
            requirements: task.params.requirements || []
        });

        emitAgentState(this.id, 'working', {
            step: 'Code generated, preparing delivery',
            progress: 80
        });

        // Guardar ZIP temporalmente
        const zipPath = path.join(process.cwd(), 'temp', `${this.id}-${Date.now()}.zip`);
        fs.writeFileSync(zipPath, zipBuffer);

        return {
            success: true,
            downloadUrl: `/api/download/${path.basename(zipPath)}`,
            filesCount: zipBuffer.length,
            framework: task.params.framework
        };
    }
}