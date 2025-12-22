
// B"H
/**
 * @file index.js
 * @description
 *  The Scribe of AI (AIManager). 
 *  Acts as the bridge between the AwtsmoosDB and the AI Engines.
 *  Updated to use the modular DirectEngine.
 */


const DirectEngine = require('./direct/index.js');

class AIManager {
    constructor(db) {
        this.db = db;
    }

    
    

    /**
     * Loads a model for inference.
     * B"H: Now uses the DirectEngine for filesystem-based model access.
     * @param {string} ggufPath - Physical path to the GGUF file
     * @param {object} options - Optional configuration
     */
    async loadModel(ggufPath, options = {}) {
        const engine = new DirectEngine(ggufPath);
        await engine.init();
        return engine;
    } 
    
    /**
     * Checks if a model exists in the DB (Legacy support).
     */
    async hasModel(modelName = 'default') {
        if(!this.db.root.ai) return false;
        const models = await this.db.root.ai.models;
        if (!models) return false;
        return await this.db.has(models, modelName);
    }
}

module.exports = AIManager;
