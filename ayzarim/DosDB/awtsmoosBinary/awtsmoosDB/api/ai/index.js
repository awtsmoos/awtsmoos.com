// B"H
/**
 * @file index.js
 * @description
 *  The Sefirah of Chokhmah (Wisdom) - The Flash of Intelligence.
 *  Governs the orchestration of LLMs and neural memory through direct manifestation.
 *  There is no delay between the thought and the word; the ink of the AI 
 *  flows directly from the binary veins of the database.
 * 
 *  STRICTLY SYNCHRONOUS. ASYNC/AWAIT DELETED FOREVER.
 */

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
     * @description Awakens a neural cortex from a file or the registry.
     */
    loadBrain(source, options = {}) {
        let actualSource = source;
        
        if (typeof source === 'string' && !source.endsWith('.gguf') && !require('fs').existsSync(source)) {
             if (this.hasModel(source)) {
                 actualSource = this.db.root.ai.models[source];
             } else {
                 throw new Error(`B"H Error: AI model source '${source}' not found.`);
             }
        }
        
        const engine = new DirectEngine(actualSource, options);
        engine.setGraphContext(this.db.graph); 
        engine.init(); // Now synchronous
        
        const brain = new AwtsmoosBrain(this.db, engine);
        brain.init(); // Now synchronous
        return brain;
    }
    
    importModel(filePath, name) {
        return this.importer.importGGUF(filePath, name);
    }

    /**
     * @description Checks the registry for manifested models.
     */
    hasModel(modelName = 'default') {
        const root = this.db.root;
        if (!this.db.has(root, 'ai')) return false;
        
        const aiRoot = root.ai;
        if (!this.db.has(aiRoot, 'models')) return false;

        return this.db.has(aiRoot.models, modelName);
    }
    
    /**
     * @description Deconstructs text into the atoms of vocabulary.
     */
    tokenize(text, engine) {
        if (!engine || !engine.tokenizer) throw new Error("B\"H: AI Engine initialization required");
        return engine.tokenizer.tokenize(text);
    }
}

module.exports = AIManager;