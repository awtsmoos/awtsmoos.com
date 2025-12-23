// B"H
const fs = require('fs');
const Loader = require('./loader.js');
const Model = require('./model.js');
const Tokenizer = require('../tokenizer.js');
const Logger = require('../utils/logger.js');
const Wasm = require('../math/wasm_jit.js');

/**
 * @module DirectEngine
 * @description The prime mover of inference. 
 * This engine generates tokens line-by-line with a beautiful, normalized ledger.
 */
class DirectEngine {
    constructor(filePath, options = {}) {
        this.filePath = filePath;
        this.options = {
            verbose: false, 
            ...options
        };
        this.loader = new Loader(this);
        this.model = new Model(this);
        
        // Inference State
        this.kv_cache = [];
        this.history = [];
        this.buffer = null; 
        this.metadata = null;
        this.vocab = [];
        this.tokenizer = null;
        this.params = {};
    }

    /**
     * Initializes the engine, model, and tokenizer.
     */
    async init() {
        if (this.options.verbose) Logger.log(`[Direct] Loading Atzmus from: ${this.filePath}`);
        
        try {
            await Wasm.init(12000); 
        } catch(e) {
            Logger.error(`[WASM] Hyper-Kernel failed to ignite. Falling back to slow JS math.`);
        }

        this.buffer = fs.readFileSync(this.filePath);
        await this.loader.load(this.buffer);
        
        const mockHandle = {
            config: { get: async (k) => {
                if(k==='vocab_size') return this.vocab.length;
                if(k==='tokenizer.ggml.add_space_prefix') return this.metadata['tokenizer.ggml.add_space_prefix'];
                return null;
            }},
            vocab_data: { get: async () => null }
        };
        
        this.tokenizer = new Tokenizer(mockHandle);
        this.tokenizer.vocab = this.vocab;
        this.tokenizer.scores = this.loader.scores ? new Float32Array(this.loader.scores) : new Float32Array(this.vocab.length).fill(0);
        
        await this.tokenizer.init(); 
        if (this.options.verbose) Logger.log(`[Direct] Ready. Architecture: ${this.params.arch}, Layers: ${this.params.n_layer}`);
    }

    /**
     * Resets the context of the inference.
     */
    resetContext() {
        this.kv_cache = [];
        this.history = [];
        if(global.gc) global.gc();
    }

    /**
     * Generates a text response.
     * @param {string} prompt 
     * @param {Function} callback 
     * @param {object} options 
     */
    async generate(prompt, callback, options={}) {
        let fullPrompt = `<start_of_turn>user\n${prompt}<end_of_turn>\n<start_of_turn>model\n`;
        if (this.options.verbose) Logger.log(`[Direct] Processing Prompt (${fullPrompt.length} chars)...`);
        
        let tokens = await this.tokenizer.tokenize(fullPrompt);
        if (this.params.arch.includes('gemma') && this.history.length === 0 && tokens[0] !== 2) {
             tokens.unshift(2); 
        }
        
        let lastHidden = null;
        
        // 1. Context Ingestion
        if (this.options.verbose) console.log(`B"H [Tracing Prompt: ${tokens.length} tokens]`);
        for (let i = 0; i < tokens.length; i++) {
            lastHidden = await this.model.forward(tokens[i], this.history.length);
            this.history.push(tokens[i]);
        }
        
        if (this.options.verbose) Logger.log(`[Direct] Loop Active.`);
        const maxTokens = options.maxTokens || 128;
        
        // 2. Generation Loop
        for (let i = 0; i < maxTokens; i++) {
            const tokenStartTime = process.hrtime.bigint();
            
            const logits = await this.model.computeLogits(lastHidden);
            
            // B"H: Safety check to prevent <pad> (0) unless specifically chosen (rare).
            // Actually, <pad> shouldn't be chosen. We can mask it.
            // logits[0] = -Infinity; // Mask pad token
            
            const next_id = this.sample(logits);
            
            // B"H: Debug sample
            // if (i === 0) console.log(`B"H [DEBUG] First sampled ID: ${next_id}. Logit[${next_id}] = ${logits[next_id]}`);
            
            if (next_id === 1 || next_id === 106 || next_id === 107 || (next_id === 2 && this.history.length > 1)) {
                if (this.options.verbose) console.log(`B"H [End of Stream] Generation complete.`);
                break; 
            }
            
            const word = await this.tokenizer.detokenize([next_id]);
            
            const tokenEndTime = process.hrtime.bigint();
            const totalMs = Number(tokenEndTime - tokenStartTime) / 1e6;
            
            const timestamp = new Date().toISOString().split('T')[1].split('Z')[0];
            const displayToken = JSON.stringify(word).replace(/^"|"$/g, '').padEnd(16);
            
            console.log(`[${timestamp}] | Token: "${displayToken}" | Speed: ${totalMs.toFixed(2).padStart(8)}ms`);
            
            if (callback) callback(word);
            
            this.history.push(next_id);
            lastHidden = await this.model.forward(next_id, this.history.length - 1);
        }
    }

    /**
     * Greedy sampling of the logits.
     * @param {Float32Array} logits 
     */
    sample(logits) {
        let max = -Infinity, idx = 0;
        // B"H: Use Wasm.copyOut if needed
        const data = (logits._wasmPtr !== undefined) ? Wasm.copyOut(logits) : logits;
        
        for(let i=0; i<data.length; i++) {
            if(data[i] > max) { max = data[i]; idx = i; }
        }
        return idx;
    }
}

module.exports = DirectEngine;
