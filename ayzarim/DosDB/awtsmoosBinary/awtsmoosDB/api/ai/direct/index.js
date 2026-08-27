
// B"H
/**
 * @file index.js
 * @description
 * Chapter 13: Direct Engine Orchestrator
 */

const Loader = require('./loader.js');
const Model = require('./model.js');
const Tokenizer = require('../tokenizer.js');
const Logger = require('../utils/logger.js');
const Wasm = require('../math/wasm/jit.js');
const { FileSource, DbSource } = require('./tensor/source.js');
const Generator = require('./generator.js');

class DirectEngine {
    constructor(modelSource, options = {}) {
        this.options = { verbose: false, ...options };
        
        const HandleRegistry = require('../../../core/registry/handle.js');
        const soul = (typeof modelSource !== 'string') ? HandleRegistry.getSoul(modelSource) : null;
        
        const SourceStrategies = {
            'string': () => new FileSource(modelSource),
            'object': () => {
                if (!soul) throw new Error("B\"H Invalid model source. Provide GGUF file path or DB LiveHandle.");
                this.db = soul.db;
                return new DbSource(modelSource);
            }
        };

        this.source = SourceStrategies[typeof modelSource]();

        this.loader = new Loader(this);
        this.model = new Model(this);
        this.generator = new Generator(this);
        
        this.kv_cache = [];
        this.history = [];
        this.vocab = [];
        this.tokenizer = null;
        this.params = {};
        this.graphContext = null;
    }

    async init() {
        if (this.options.verbose) Logger.log(`[Direct] Initializing Engine (${this.source.type})...`);
        try { await Wasm.init(32768); } catch(e) { Logger.error(`[WASM] Hyper-Kernel failed. Falling back to JS.`); }

        await this.source.init();
        if (this.source.type === 'file') this.buffer = this.source.buffer;

        await this.loader.load(this.source);
        
        const mockHandle = {
            config: { get: async (k) => {
                if(k==='vocab_size') return this.vocab.length;
                return this.metadata[k];
            }},
            vocab_data: { get: async () => null }
        };
        
        this.tokenizer = new Tokenizer(mockHandle);
        this.tokenizer.vocab = this.vocab;
        this.tokenizer.scores = this.loader.scores ? new Float32Array(this.loader.scores) : new Float32Array(this.vocab.length).fill(0);
        
        await this.tokenizer.init(); 
        if (this.options.verbose) Logger.log(`[Direct] Ready. Arch: ${this.params.arch}`);
    }

    setGraphContext(db) { this.graphContext = db; }
    resetContext() { this.kv_cache = []; this.history = []; }

    async generate(prompt, callback, options={}) {
        return this.generator.generate(prompt, callback, options);
    }
    
    async getEmbedding(text) {
         return this.generator.getEmbedding(text);
    }
}

module.exports = DirectEngine;
