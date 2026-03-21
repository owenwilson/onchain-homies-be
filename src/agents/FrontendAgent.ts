import { BaseAgent, Task } from './BaseAgent';

export class FrontendAgent extends BaseAgent {
    constructor(name: string, privateKey?: string) {
        super(name, 'frontend', privateKey);
    }

    protected async runTask(task: Task): Promise<any> {
        // Simular generación de código React
        const componentName = task.params.componentName || 'Button';

        return {
            code: `import React from 'react';\n\nconst ${componentName} = () => {\n  return <button className="px-4 py-2 bg-blue-500 text-white rounded">\n    ${componentName}\n  </button>;\n};\n\nexport default ${componentName};`,
            lines: 8,
            framework: 'react'
        };
    }
}