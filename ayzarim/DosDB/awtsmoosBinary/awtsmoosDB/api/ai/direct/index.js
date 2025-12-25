// B"H
// File: /BH/awtsmoos.com/ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/api/ai/direct/index.js

const Loader = require('./loader.js');
const Model = require('./model.js');
const Tokenizer = require('../tokenizer.js');
const Logger = require('../utils/logger.js');
const Wasm = require('../math/wasm_jit.js');
const { FileSource, DbSource } = require('./tensor_source.js');

class DirectEngine {
    constructor(modelSource, options = {}) {
        this.options = { verbose: false, ...options };
        
        // B"H: Identification via Registry
        const soul = (typeof modelSource !== 'string') ? require('../../../core/handleRegistry.js').getSoul(modelSource) : null;
        
        if (typeof modelSource === 'string') {
            this.source = new FileSource(modelSource);
        } else if (soul) {
             this.db = soul.db;
             this.source = new DbSource(modelSource);
        } else {
             throw new Error("Invalid model source. Provide GGUF file path or DB LiveHandle.");
        }

        this.loader = new Loader(this);
        this.model = new Model(this);
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
        let fullPrompt = `<start_of_turn>user\n${prompt.trim()}<end_of_turn>\n<start_of_turn>model\n`;
        let tokens = await this.tokenizer.tokenize(fullPrompt);
        
        const isGemma = this.params.arch.includes('gemma');
        const bosId = isGemma ? 2 : 1;
        if (this.history.length === 0 && tokens[0] !== bosId) tokens.unshift(bosId);
        
        let lastHidden = null;
        for (let i = 0; i < tokens.length; i++) {
            lastHidden = await this.model.forward(tokens[i], this.history.length);
            this.history.push(tokens[i]);
        }
        
        const maxTokens = options.maxTokens || 128;
        for (let i = 0; i < maxTokens; i++) {
            const start = process.hrtime.bigint();
            const logits = await this.model.computeLogits(lastHidden);
            const next_id = await this.sample(logits, this.history, { temp: 0.8, top_p: 0.9, ...options });
            
            if (next_id === 1 || next_id === 106 || next_id === 107) break;
            
            const word = await this.tokenizer.detokenize([next_id]);
            const ms = (Number(process.hrtime.bigint() - start) / 1e6).toFixed(2);
            if (options.streamTimestamps) console.log(`[Token] ${JSON.stringify(word)} ${ms}ms`);
            if (callback) callback(word);
            
            this.history.push(next_id);
            lastHidden = await this.model.forward(next_id, this.history.length - 1);
        }
    }
    
    async getEmbedding(text) {
         let tokens = await this.tokenizer.tokenize(text);
         this.resetContext(); 
         let lastHidden = null;
         for(let t of tokens) {
             lastHidden = await this.model.forward(t, this.history.length);
             this.history.push(t);
         }
         return lastHidden; 
    }

    async sample(logits, history, config) {
        let probs = (logits._wasmPtr !== undefined) ? Wasm.copyOut(logits) : new Float32Array(logits);
        let maxLogit = -Infinity;
        for(let i=0; i<probs.length; i++) {
            probs[i] /= config.temp;
            if(probs[i] > maxLogit) maxLogit = probs[i];
        }
        let sum = 0;
        for(let i=0; i<probs.length; i++) {
            const p = Math.exp(probs[i] - maxLogit);
            probs[i] = p;
            sum += p;
        }
        const r = Math.random() * sum;
        let acc = 0;
        for (let i = 0; i < probs.length; i++) {
            acc += probs[i];
            if (acc >= r) return i;
        }
        return 0;
    }
}

module.exports = DirectEngine;
