
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
 * This engine generates tokens with precise alignment to the browser worker.
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
     * B"H
     * Initializes the engine, model, and tokenizer.
     */
    async init() {
        if (this.options.verbose) Logger.log(`[Direct] Loading Atzmus from: ${this.filePath}`);
        
        try {
            // PHYSICS FIX - 2GB memory upfront prevents detachment
            await Wasm.init(32768); 
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
     * B"H
     * Resets the context of the inference.
     */
    resetContext() {
        this.kv_cache = [];
        this.history = [];
        if(global.gc) global.gc();
    }

    /**
     * B"H
     * Generates a text response using Gemma 3 IT templates.
     */
    async generate(prompt, callback, options={}) {
        // B"H - Symmetry check: Match browser template exactly
        let fullPrompt = `<start_of_turn>user\n${prompt.trim()}<end_of_turn>\n<start_of_turn>model\n`;
        if (this.options.verbose) Logger.log(`[Direct] Processing Prompt...`);
        
        let tokens = await this.tokenizer.tokenize(fullPrompt);
        
        // Gemma logic: Ensure BOS (2) at the start of a fresh session
        if (this.params.arch.includes('gemma') && this.history.length === 0 && tokens[0] !== 2) {
             tokens.unshift(2); 
        }
        
        let lastHidden = null;
        
        // 1. Context Ingestion
        for (let i = 0; i < tokens.length; i++) {
            lastHidden = await this.model.forward(tokens[i], this.history.length);
            this.history.push(tokens[i]);
        }
        
        const maxTokens = options.maxTokens || 128;
        const config = {
            temp: options.temp || 0.8,
            top_p: options.top_p || 0.9,
            repeat_penalty: options.repeat_penalty || 1.1,
            penalty_n: 64
        };
        
        // 2. Generation Loop
        for (let i = 0; i < maxTokens; i++) {
            const tokenStartTime = process.hrtime.bigint();
            
            const logits = await this.model.computeLogits(lastHidden);
            const next_id = this.sample(logits, this.history, config);
            
            // Standard Gemma End-of-Turn tokens
            if (next_id === 1 || next_id === 106 || next_id === 107 || (next_id === 2 && this.history.length > tokens.length)) {
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
     * B"H
     * Advanced Sampler with Nucleus Robustness.
     */
    sample(logits, history, config) {
        let probs = (logits._wasmPtr !== undefined) ? Wasm.copyOut(logits) : new Float32Array(logits);
        
        // 1. Repetition Penalty
        const start = Math.max(0, history.length - config.penalty_n);
        const context = history.slice(start);
        const seen = new Set(context);
        for (const id of seen) {
            if (probs[id] > 0) probs[id] /= config.repeat_penalty;
            else probs[id] *= config.repeat_penalty;
        }

        // 2. Temperature
        let maxLogit = -Infinity;
        if (config.temp <= 0) config.temp = 0.01;
        for(let i=0; i<probs.length; i++) {
            probs[i] /= config.temp;
            if(probs[i] > maxLogit && Number.isFinite(probs[i])) maxLogit = probs[i];
        }
        
        // 3. Softmax
        let sum = 0;
        for(let i=0; i<probs.length; i++) {
            const p = Math.exp(probs[i] - maxLogit);
            probs[i] = p;
            sum += p;
        }
        
        // 4. Top-P
        let candidates = [];
        const threshold = 0.0001 / (probs.length || 1);
        for(let i=0; i<probs.length; i++) {
            const p = probs[i] / (sum || 1);
            if(p > threshold) candidates.push({ id: i, p });
        }
        
        candidates.sort((a,b) => b.p - a.p);
        
        // Fallback to greedy if numerical collapse
        if (candidates.length === 0) {
            let topId = 0;
            let topVal = -Infinity;
            for(let i=0; i<probs.length; i++) {
                if (probs[i] > topVal) { topVal = probs[i]; topId = i; }
            }
            return topId;
        }

        let cumSum = 0;
        let cutoff = candidates.length - 1;
        for(let i=0; i<candidates.length; i++) {
            cumSum += candidates[i].p;
            if(cumSum >= config.top_p) {
                cutoff = i;
                break;
            }
        }
        
        const r = Math.random() * cumSum;
        let acc = 0;
        for(let i=0; i<=cutoff; i++) {
            acc += candidates[i].p;
            if(acc >= r) return candidates[i].id;
        }
        
        return candidates[0].id;
    }
}

module.exports = DirectEngine;
