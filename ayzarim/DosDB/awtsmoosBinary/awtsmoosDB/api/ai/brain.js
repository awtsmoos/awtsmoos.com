//B"H
// File: /BH/awtsmoos.com/ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/api/ai/brain.js

const Logger = require('./utils/logger.js');

class AwtsmoosBrain {
    constructor(db, engine) {
        this.db = db;
        this.ai = engine; // The DirectEngine instance
        this.memoryPath = "ai_memory"; // Root list for storing interactions
        this.dim = 0; // Will be set on init
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
        if (!await this.db.has(root, this.memoryPath)) {
            Logger.log(`[Brain] Creating Memory Cortex at 'root.${this.memoryPath}'...`);
            // B"H: New assignment paradigm.
            root[this.memoryPath] = new this.db.List();
        }

        const memHandle = root[this.memoryPath];
        
        Logger.log(`[Brain] Linking Visual Cortex (Vectors) to Memory (Dim: ${this.dim})...`);
        await this.db.vector.enable(memHandle, { 
            dimensions: this.dim, 
            metric: 'cosine' 
        });
        
        await this.db.search.enable(memHandle);
        
        await this.db.waitForIdle();
        Logger.log("[Brain] Conscious.");
    }

    /**
     * @description
     * The Main Loop of Thought:
     * 1. Embed Input.
     * 2. Recall Context from DB.
     * 3. Infer Response.
     * 4. Save to Memory.
     * 
     * @param {string} userText 
     * @param {function} onToken 
     * @param {object} options - Pass { streamTimestamps: true } for timestamped logs
     */
    async chat(userText, onToken, options = {}) {
        Logger.log(`[Brain] Input: "${userText}"`);

        // 1. Embed (Self-Reflection)
        const inputVector = await this.ai.getEmbedding(userText);
        
        // 2. Retrieval (Recall)
        const memHandle = this.db.root[this.memoryPath];
        const memories = await this.db.vector.nearest(memHandle, inputVector, 3);
        
        let contextBlock = "";
        if (memories.length > 0) {
            Logger.log(`[Brain] Recalled ${memories.length} relevant context fragments.`);
            const facts = memories.map(m => m.item.text).join("\n- ");
            contextBlock = `\nRelevant Context from your memory:\n- ${facts}\n`;
        }

        // 3. Prompt Construction
        const systemPrompt = "You are an AI connected to a persistent AwtsmoosDB memory. Use the context provided to answer accurately.";
        const fullPrompt = `${systemPrompt}${contextBlock}\nUser: ${userText}\nAI:`;

        this.ai.resetContext();

        // 4. Inference (Speech)
        let fullResponse = "";
        await this.ai.generate(fullPrompt, (token) => {
            fullResponse += token;
            if(onToken) onToken(token);
        }, options);

        // 5. Memorization (Encoding)
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