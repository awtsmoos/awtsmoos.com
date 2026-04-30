
//B"H
/**
 * @file brain.js
 * @description
 * Chapter 45: The Artificial Mind.
 * An empty vessel (the AI Engine) is filled with the experiences stored in the DB.
 * It recalls, it ponders, and then it speaks, all within the unity of the Awtsmoos.
 */

const Logger = require('./utils/logger.js');

class AwtsmoosBrain {
    constructor(db, engine) {
        this.db = db;
        this.ai = engine; 
        this.memoryPath = "ai_memory"; 
        this.dim = 0; 
    }

    /**
     * @description Initialize the Brain's neural and storage vessels.
     */
    async init() {
        if (!this.ai.params.n_embd) {
            throw new Error("B\"H: AI Engine not initialized. Call ai.init() first.");
        }
        this.dim = this.ai.params.n_embd;
        
        const root = this.db.root;
        // B"H: Accessing keys via the LiveHandle portal
        if (!this.db.has(root, this.memoryPath)) {
            Logger.log(`[Brain] Creating Memory Cortex at 'root.${this.memoryPath}'...`);
            root[this.memoryPath] = new this.db.List();
        }

        const memHandle = root[this.memoryPath];
        
        Logger.log(`[Brain] Linking Visual Cortex to Memory (Dim: ${this.dim})...`);
        await this.db.vector.enable(memHandle, { 
            dimensions: this.dim, 
            metric: 'cosine' 
        });
        
        await this.db.search.enable(memHandle);
        await this.db.waitForIdle();
        Logger.log("[Brain] Conscious.");
    }

    /**
     * @description The Main Loop of Thought.
     */
    async chat(userText, onToken, options = {}) {
        Logger.log(`[Brain] Input: "${userText}"`);

        const inputVector = await this.ai.getEmbedding(userText);
        
        const memHandle = this.db.root[this.memoryPath];
        const memories = await this.db.vector.nearest(memHandle, inputVector, 3);
        
        let contextBlock = "";
        if (memories.length > 0) {
            Logger.log(`[Brain] Recalled ${memories.length} relevant context fragments.`);
            const facts = memories.map(m => m.item.text).join("\n- ");
            contextBlock = `\nRelevant Context from your memory:\n- ${facts}\n`;
        }

        const systemPrompt = "You are an AI connected to a persistent AwtsmoosDB memory. Use the context provided to answer accurately.";
        const fullPrompt = `${systemPrompt}${contextBlock}\nUser: ${userText}\nAI:`;

        this.ai.resetContext();

        let fullResponse = "";
        await this.ai.generate(fullPrompt, (token) => {
            fullResponse += token;
            if(onToken) onToken(token);
        }, options);

        const memoryItem = {
            role: "interaction",
            text: `User asked: "${userText}". AI answered: "${fullResponse}"`,
            timestamp: Date.now(),
            vector: inputVector 
        };
        
        await memHandle.push(memoryItem);
        return fullResponse;
    }
}

module.exports = AwtsmoosBrain;
