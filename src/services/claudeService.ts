import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

export interface ClaudeTask {
    description: string;
    framework: string;
    requirements: string[];
}

export const executeClaudeTask = async (task: ClaudeTask): Promise<Buffer> => {
    const prompt = `You are a senior full-stack developer. Generate a complete ${task.framework} application based on:

DESCRIPTION: ${task.description}
REQUIREMENTS: ${task.requirements.join(', ')}

Generate the complete project with all necessary files. Return the code in a structured format where each file is clearly marked with its path.

Format example:
FILE: src/App.js
\`\`\`jsx
// code here
\`\`\`

Generate production-ready, clean code with proper structure.`;

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY not set');
    }

    console.log('🤖 Calling Claude API...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 8192,
            temperature: 0.7,
            messages: [{ role: 'user', content: prompt }]
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Claude API error:', response.status, errorText);
        throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Claude API response received');

    let content = '';
    for (const block of data.content) {
        if (block.type === 'text') {
            content += block.text;
        }
    }

    const files = parseClaudeResponse(content);
    const zipBuffer = await createZipArchive(files);

    return zipBuffer;
};

const parseClaudeResponse = (response: string): Map<string, string> => {
    const files = new Map<string, string>();
    const fileRegex = /FILE:\s*([^\n]+)\n```(?:\w+)?\n([\s\S]*?)```/g;

    let match;
    while ((match = fileRegex.exec(response)) !== null) {
        const filePath = match[1].trim();
        const content = match[2].trim();
        files.set(filePath, content);
    }

    return files;
};

const createZipArchive = async (files: Map<string, string>): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.on('data', (chunk) => chunks.push(chunk));
        archive.on('end', () => resolve(Buffer.concat(chunks)));
        archive.on('error', reject);

        for (const [filePath, content] of files) {
            archive.append(content, { name: filePath });
        }

        archive.finalize();
    });
};