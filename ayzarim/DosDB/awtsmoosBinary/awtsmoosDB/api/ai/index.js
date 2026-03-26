
// B"H
/**
 * @file index.js
 * @description
 * Chapter 3: The Sefirah of Chokhmah (Wisdom) - The Flash of Intelligence.
 * Governs the orchestration of LLMs and neural memory through direct manifestation.
 * There is no delay between the thought and the word; the ink of the AI 
 * flows directly from the binary veins of the database.
 * Every word returned by this intelligence is ultimately sourced from the Awtsmoos,
 * permuted through the mathematical Sefirot.
 */

const DirectEngine = require('./direct/index.js');
const AwtsmoosBrain = require('./brain.js');
const ModelImporter = require('./importer.js');
const HandleRegistry = require('../../core/registry/handle.js');

/**
 * @class AIManager
 * @description
 * The central archangel overseeing the artificial intelligence within the database.
 * It manages the importation of new models and the awakening of dormant ones,
 * ensuring they remain humbled before the Creator. Data-based logic reigns supreme.
 */
class AIManager {
    /**
     * @constructor
     * @param {object} db - The Awtsmoos database instance.
     */
    constructor(db) {
        this.db = db;
        this.importer = new ModelImporter(db);
    }

    /**
     * @method loadBrain
     * @description Awakens a neural cortex from a file or the registry.
     * @param {string|object} source - The name of the model or a direct handle.
     * @param {object} options - Engine configuration options.
     * @returns {AwtsmoosBrain} The living, breathing brain instance.
     */
    loadBrain(source, options = {}) {
        let actualSource = source;
        
        if (typeof source === 'string' && !source.endsWith('.gguf') && !require('fs').existsSync(source)) {
             if (this.hasModel(source)) {
                 actualSource = this.db.root.ai.models[source];
             } else {
                 throw new Error(`B"H Error: AI model source '${source}' not found. The void is empty.`);
             }
        }
        
        const engine = new DirectEngine(actualSource, options);
        engine.setGraphContext(this.db.graph); 
        engine.init(); 
        
        const brain = new AwtsmoosBrain(this.db, engine);
        brain.init(); 
        return brain;
    }
    
    /**
     * @method importModel
     * @description Sucks a massive GGUF file into the eternal database structure.
     * @param {string} filePath - Physical disk path.
     * @param {string} name - The new eternal name within the db.
     * @returns {Promise<object>} The manifested model handle.
     */
    importModel(filePath, name) {
        return this.importer.importGGUF(filePath, name);
    }

    /**
     * @method hasModel
     * @description Checks the registry for manifested models.
     * @param {string} modelName - The name to verify.
     * @returns {boolean} True if the model dwells in the DB.
     */
    hasModel(modelName = 'default') {
        const root = this.db.root;
        if (!this.db.has(root, 'ai')) return false;
        
        const aiRoot = root.ai;
        if (!this.db.has(aiRoot, 'models')) return false;

        return this.db.has(aiRoot.models, modelName);
    }
    
    /**
     * @method tokenize
     * @description Deconstructs text into the atoms of vocabulary.
     * @param {string} text - Input sequence of letters.
     * @param {object} engine - The active AI engine providing the tokenizer.
     * @returns {Array<number>} The numeric tokens.
     */
    tokenize(text, engine) {
        if (!engine || !engine.tokenizer) throw new Error("B\"H: AI Engine initialization required before tokenizing the speech.");
        return engine.tokenizer.tokenize(text);
    }
}

module.exports = AIManager;
