
// B"H
const Importer = require('./importer.js');
const InferenceEngine = require('./inference/index.js');

class AIManager {
    constructor(db) {
        this.db = db;
    }

    /**
     * Imports a GGUF file into the database.
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
     * Loads a model handle for inference.
     * @param {string} modelName
     * @param {object} options - Engine options (e.g., { useWasm: true })
     */
    async loadModel(modelName = 'default', options = {}) {
        const models = await this.db.root.ai.models;
        if (!models) throw new Error("No models found in DB.");
        
        const exists = await this.db.has(this.db.root.ai.models, modelName);
        if (!exists) throw new Error(`Model '${modelName}' not found.`);

        const modelHandle = this.db.root.ai.models[modelName];
        return new InferenceEngine(this.db, modelHandle, options);
    }
    
    /**
     * Checks if a model exists.
     */
    async hasModel(modelName = 'default') {
        if(!this.db.root.ai) return false;
        const models = await this.db.root.ai.models;
        if (!models) return false;
        return await this.db.has(models, modelName);
    }
}

module.exports = AIManager;
