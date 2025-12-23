// File: /BH/awtsmoos.com/ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/api/ai/index.js

const DirectEngine = require('./direct/index.js');
const AwtsmoosBrain = require('./brain.js');

class AIManager {
    constructor(db) {
        this.db = db;
    }

    /**
     * Loads a model and attaches a Brain.
     * @param {string} ggufPath 
     * @param {object} options
     */
    async loadBrain(ggufPath, options = {}) {
        const engine = new DirectEngine(ggufPath, options);
        await engine.init();
        
        const brain = new AwtsmoosBrain(this.db, engine);
        await brain.init();
        
        return brain;
    }

    /**
     * Low-level model load (no memory/DB connection)
     * @param {string} ggufPath 
     * @param {object} options
     */
    async loadModel(ggufPath, options = {}) {
        const engine = new DirectEngine(ggufPath, options);
        await engine.init();
        return engine;
    } 
    
    async hasModel(modelName = 'default') {
        if(!this.db.root.ai) return false;
        const models = await this.db.root.ai.models;
        if (!models) return false;
        return await this.db.has(models, modelName);
    }
}

module.exports = AIManager;
