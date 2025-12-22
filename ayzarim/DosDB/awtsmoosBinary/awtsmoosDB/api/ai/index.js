
// B"H
/**
 * @file index.js
 * @description
 *  The Scribe of AI (AIManager). 
 *  Acts as the bridge between the AwtsmoosDB and the AI Engines.
 *  Updated to use the modular DirectEngine.
 */

const Importer = require('./importer.js');
const DirectEngine = require('./direct/index.js');

class AIManager {
    constructor(db) {
        this.db = db;
    }

    /**
     * Imports a GGUF file into the database.
     * Note: If using DirectEngine exclusively, this is optional.
     * @param {string} ggufPath - Path to .gguf file
     * @param {string} modelName - Unique name (key) for the model in DB
     */
    async importModel(ggufPath, modelName = 'default') {
        const importer = new Importer(this.db);
        console.log(`B"H [AI] Importing model '${modelName}' from ${ggufPath}...`);
        await importer.import(ggufPath, modelName);
        console.log(`B"H [AI] Import complete.`);
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
