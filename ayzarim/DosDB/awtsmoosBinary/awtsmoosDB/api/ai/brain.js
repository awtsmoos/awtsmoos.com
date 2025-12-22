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
     * Initialize the Brain.
     * 1. Check if AI Engine is ready.
     * 2. Ensure DB has Vector Index enabled for memory.
     */
    async init() {
        if (!this.ai.params.n_embd) {
            throw new Error("B\"H: AI Engine not initialized. Call ai.init() first.");
        }
        this.dim = this.ai.params.n_embd;
        
        // Ensure memory container exists
        const root = this.db.root;
        // Check if list exists, if not create
        // We use a try/catch or check existence because we don't have a direct existsSync on LiveHandle
        if (!await this.db.has(root, this.memoryPath)) {
            Logger.log(`[Brain] Creating Memory Cortex at 'root.${this.memoryPath}'...`);
            await this.db.createList(root, this.memoryPath);
        }

        const memHandle = root[this.memoryPath];
        
        // Enable Vector Search on this memory list using the Model's dimension
        Logger.log(`[Brain] Linking Visual Cortex (Vectors) to Memory (Dim: ${this.dim})...`);
        await this.db.vector.enable(memHandle, { 
            dimensions: this.dim, 
            metric: 'cosine' 
        });
        
        // Enable Text Search too
        await this.db.search.enable(memHandle);
        
        await this.db.waitForIdle();
        Logger.log("[Brain] Conscious.");
    }

    /**
     * The Main Loop:
     * 1. Embed User Input (using AI).
     * 2. Search DB for Context.
     * 3. Construct Prompt.
     * 4. Stream Response.
     * 5. Memorize Interaction.
     */
    async chat(userText, onToken) {
        Logger.log(`[Brain] Input: "${userText}"`);

        // 1. Embed (Self-Reflection)
        // Uses the same model to understand the input as will generate the output
        const inputVector = await this.ai.getEmbedding(userText);
        
        // 2. Retrieval (Recall)
        const memHandle = this.db.root[this.memoryPath];
        const memories = await this.db.vector.nearest(memHandle, inputVector, 3); // Get top 3 relevancies
        
        let contextBlock = "";
        if (memories.length > 0) {
            Logger.log(`[Brain] Recalled ${memories.length} memories.`);
            const facts = memories.map(m => m.item.text).join("\n- ");
            contextBlock = `\nRelevant Context:\n- ${facts}\n`;
        }

        // 3. Prompt Construction (The Thought)
        const systemPrompt = "You are an AI connected to a persistent AwtsmoosDB memory.";
        const fullPrompt = `${systemPrompt}${contextBlock}\nUser: ${userText}\nAI:`;

        // 4. Goldfish Protocol: Reset RAM
        this.ai.resetContext();

        // 5. Inference (Speech)
        let fullResponse = "";
        await this.ai.generate(fullPrompt, (token) => {
            fullResponse += token;
            if(onToken) onToken(token);
        });

        // 6. Memorization (Encoding)
        // Save this turn to the DB so it can be recalled later
        const memoryItem = {
            role: "interaction",
            text: `User asked: "${userText}". AI answered: "${fullResponse}"`,
            timestamp: Date.now(),
            vector: inputVector // We store the prompt's vector to find this interaction again by similarity
        };
        
        await memHandle.push(memoryItem);
        // Background flush handled by DB
        
        return fullResponse;
    }
}

module.exports = AwtsmoosBrain;