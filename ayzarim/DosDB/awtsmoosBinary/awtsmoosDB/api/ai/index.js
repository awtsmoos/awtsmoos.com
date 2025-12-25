//B"H
// File: /BH/awtsmoos.com/ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/api/ai/index.js

const DirectEngine = require('./direct/index.js');
const AwtsmoosBrain = require('./brain.js');
const ModelImporter = require('./importer.js');
const HandleRegistry = require('../../core/handleRegistry.js');

class AIManager {
    constructor(db) {
        this.db = db;
        this.importer = new ModelImporter(db);
    }

    /**
     * @description Loads a model from FILE or DB and attaches a Brain.
     */
    async loadBrain(source, options = {}) {
        let actualSource = source;
        
        // B"H: If source is a string name, look it up in the registry
        if (typeof source === 'string' && !source.endsWith('.gguf') && !require('fs').existsSync(source)) {
             if (await this.hasModel(source)) {
                 actualSource = this.db.root.ai.models[source];
             } else {
                 throw new Error(`B"H Error: Model source '${source}' not found on disk or in DB registry.`);
             }
        }
        
        const engine = new DirectEngine(actualSource, options);
        engine.setGraphContext(this.db.graph); 
        await engine.init();
        
        const brain = new AwtsmoosBrain(this.db, engine);
        await brain.init();
        return brain;
    }
    
    async importModel(filePath, name) {
        return this.importer.importGGUF(filePath, name);
    }

    async hasModel(modelName = 'default') {
        // B"H: Use the DB's portals to check handle existence via registry
        if (!await this.db.has(this.db.root, 'ai')) return false;
        
        const aiRoot = this.db.root.ai;
        if (!await this.db.has(aiRoot, 'models')) return false;

        const modelsHandle = aiRoot.models;
        return await this.db.has(modelsHandle, modelName);
    }
    
    async tokenize(text, engine) {
        if (!engine || !engine.tokenizer) throw new Error("B\"H: Initialized Engine required");
        const tokens = await engine.tokenizer.tokenize(text);
        return new Int32Array(tokens);
    }
}

module.exports = AIManager;
