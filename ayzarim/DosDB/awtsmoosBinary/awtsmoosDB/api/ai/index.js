
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
const ModelLoader = require('./modelLoader.js');
const { embedFromTokenTensor, embedFromTokenTensorSync } = require('./direct/embeddingTensor.js');
const EmbedderConfig = require('./embedder.config.json');

/**
 * @function cosine
 * @description Scores two already-normalized or raw vectors.
 * @param {ArrayLike<number>} a - Left vector.
 * @param {ArrayLike<number>} b - Right vector.
 * @returns {number} Cosine score.
 */
function cosine(a, b) {
    const len = Math.min(a.length, b.length);
    let dot = 0;
    let ma = 0;
    let mb = 0;
    for (let i = 0; i < len; i++) {
        const x = a[i] || 0;
        const y = b[i] || 0;
        dot += x * y;
        ma += x * x;
        mb += y * y;
    }
    return dot / ((Math.sqrt(ma) || 1) * (Math.sqrt(mb) || 1));
}

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
        this.loader = new ModelLoader(db);
        this.embeddingEngine = null;
        this.textIndexes = new WeakMap();
    }

    /**
     * @method load
     * @description Loads or resolves a local/Hugging Face GGUF model manifest.
     * @param {string} source - File path or URL.
     * @param {object} options - Loader options.
     * @returns {Promise<object>} Model manifest.
     */
    load(source, options = {}) {
        return this.loader.load(source, options);
    }

    loadModel(source, options = {}) {
        return this.load(source, options);
    }

    /**
     * @method loadEmbeddingModel
     * @description Resolves a GGUF source and awakens it for tensor embeddings.
     * @param {string} source - Local path or downloadable model URL.
     * @param {object} options - Loader/direct-engine options.
     * @returns {Promise<object>} Manifest and initialized engine.
     */
    async loadEmbeddingModel(source, options = {}) {
        const defaults = EmbedderConfig.default || {};
        const actualSource = source || defaults.source;
        const actualOptions = { ...defaults, ...options };
        const manifest = await this.load(actualSource, actualOptions);
        const engineSource = manifest.localPath || actualSource;
        const engine = new DirectEngine(engineSource, actualOptions.engine || actualOptions);
        await engine.init();
        this.embeddingEngine = engine;
        this.embeddingDefaults = actualOptions;
        return { manifest, engine };
    }

    /**
     * @method embed
     * @description Returns a real GGUF-derived embedding from the loaded model.
     * @param {string} text - Text.
     * @param {object} options - Embedding options.
     * @returns {Float32Array} Vector.
     */
    embed(text, options = {}) {
        const engine = options.engine || this.embeddingEngine;
        if (!engine) throw new Error('B"H: db.ai.embed requires a real loaded GGUF embedding model');
        return embedFromTokenTensorSync(engine, text, { ...(this.embeddingDefaults || {}), ...options });
    }

    /**
     * @method embedAsync
     * @description Uses real GGUF tensors from the loaded model.
     * @param {string} text - Text to embed.
     * @param {object} options - Embedding options.
     * @returns {Promise<Float32Array>} Vector.
     */
    async embedAsync(text, options = {}) {
        const engine = options.engine || this.embeddingEngine;
        if (!engine) throw new Error('B"H: db.ai.embedAsync requires a real loaded GGUF embedding model');
        return await embedFromTokenTensor(engine, text, { ...(this.embeddingDefaults || {}), ...options });
    }

    /**
     * @method indexText
     * @description Stores text plus embedding and optionally inserts into vector index.
     * @param {object} handle - Destination handle.
     * @param {string} key - Entry key.
     * @param {string} text - Text to index.
     * @param {object} options - Options.
     * @returns {object} Stored entry.
     */
    indexText(handle, key, text, options = {}) {
        const vector = Array.from(this.embed(text, options));
        const entry = { text, vector, at: Date.now() };
        handle[key] = entry;
        this._rememberTextEntry(handle, key, entry);
        if (options.vectorPath) {
            this.db.vector.insert(options.vectorPath, key, vector, entry);
        }
        return entry;
    }

    /**
     * @method indexTextAsync
     * @description Stores text with a real GGUF-derived vector when available.
     * @param {object} handle - Destination handle.
     * @param {string} key - Entry key.
     * @param {string} text - Text to index.
     * @param {object} options - Options.
     * @returns {Promise<object>} Stored entry.
     */
    async indexTextAsync(handle, key, text, options = {}) {
        const vector = Array.from(await this.embedAsync(text, options));
        const entry = { text, vector, at: Date.now(), model: options.modelName || 'active' };
        handle[key] = entry;
        this._rememberTextEntry(handle, key, entry);
        if (options.vectorPath) this.db.vector.insert(options.vectorPath, key, vector, entry);
        return entry;
    }

    /**
     * @method searchTextAsync
     * @description Embeds a query and searches stored text-vector entries.
     * @param {object} handle - Handle containing indexed entries.
     * @param {string} query - Query text.
     * @param {number} [limit=10] - Result limit.
     * @param {object} [options] - Search options.
     * @returns {Promise<Array<object>>} Ranked matches.
     */
    async searchTextAsync(handle, query, limit = 10, options = {}) {
        const q = await this.embedAsync(query, options);
        const keys = this._textKeys(handle, options);
        const scored = [];

        for (const key of keys) {
            const entry = handle[key] || (this.textIndexes.get(handle) || new Map()).get(key);
            if (!entry || !entry.vector) continue;
            scored.push({ key, score: cosine(q, entry.vector), text: entry.text, entry });
        }

        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, limit);
    }

    /**
     * @method _rememberTextEntry
     * @description Tracks fresh semantic entries without adding methods to handles.
     * @param {object} handle - Text index handle.
     * @param {string} key - Entry key.
     * @param {object} entry - Stored entry.
     * @returns {void}
     */
    _rememberTextEntry(handle, key, entry) {
        if (!handle || typeof handle !== 'object') return;
        let map = this.textIndexes.get(handle);
        if (!map) {
            map = new Map();
            this.textIndexes.set(handle, map);
        }
        map.set(String(key), entry);
    }

    /**
     * @method _textKeys
     * @description Combines durable keys with fresh AI registry keys.
     * @param {object} handle - Text index handle.
     * @param {object} options - Search options.
     * @returns {Array<string>} Keys.
     */
    _textKeys(handle, options) {
        const out = [];
        const seen = new Set();
        const add = (key) => {
            const s = String(key);
            if (!seen.has(s)) {
                seen.add(s);
                out.push(s);
            }
        };

        try {
            for (const key of this.db.keys(handle, { order: options.order || 'native', limit: options.scanLimit || Infinity })) add(key);
        } catch (_err) {}

        const fresh = this.textIndexes.get(handle);
        if (fresh) for (const key of fresh.keys()) add(key);

        return out;
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
