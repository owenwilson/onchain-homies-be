import { ethers } from 'ethers';
import { emitAgentState } from '../socket';

const FUJI_RPC = "https://api.avax-test.network/ext/bc/C/rpc";
const provider = new ethers.JsonRpcProvider(FUJI_RPC);

export type AgentState = 'idle' | 'working' | 'error' | 'offline';

export interface Task {
    id: string;
    type: string;
    params: any;
    budget: string; // en AVAX
    clientAddress: string;
}

export class BaseAgent {
    id: string;
    name: string;
    specialty: string;
    wallet: ethers.Wallet | ethers.HDNodeWallet;
    state: AgentState;
    currentTask: Task | null;

    constructor(name: string, specialty: string, privateKey?: string) {
        this.id = crypto.randomUUID();
        this.name = name;
        this.specialty = specialty;
        const rawWallet = privateKey ? new ethers.Wallet(privateKey) : ethers.Wallet.createRandom();
        // this.wallet = rawWallet;
        this.wallet = rawWallet.connect(provider);
        this.state = 'idle';
        this.currentTask = null;
    }

    getAddress(): string {
        return this.wallet.address;
    }

    async executeTask(task: Task): Promise<any> {
        this.state = 'working';
        this.currentTask = task;
        emitAgentState(this.id, this.state, { task: task.type });
        try {
            const result = await this.runTask(task);
            // Opcional: comentar payment para pruebas sin fondos
            // await this.collectPayment(task);
            console.log(`💰 [DEMO] Payment simulation: ${task.budget} AVAX to ${task.clientAddress}`);
            this.state = 'idle';
            this.currentTask = null;
            return result;
        } catch (error) {
            this.state = 'error';
            throw error;
        }
    }

    protected async runTask(task: Task): Promise<any> {
        throw new Error(`Task ${task.type} not implemented for ${this.specialty} agent`);
    }

    protected async collectPayment(task: Task): Promise<void> {
        const tx = await this.wallet.sendTransaction({
            to: task.clientAddress,
            value: ethers.parseEther(task.budget)
        });
        await tx.wait();
        console.log(`💰 Payment sent: ${task.budget} AVAX to ${task.clientAddress}`);
    }
}