// B"H
const fs = require('fs');
const Loader = require('./loader.js');
const Model = require('./model.js');
const Tokenizer = require('../tokenizer.js');
const Logger = require('../utils/logger.js');

class DirectEngine {
    constructor(filePath) {
        this.filePath = filePath;
        this.loader = new Loader(this);
        this.model = new Model(this);
        
        this.kv_cache = [];
        this.history = [];
        
        // Low RAM Mode
        this.fd = null;
        this.headerBuffer = null;
        
        this.metadata = null;
        this.vocab = [];
        this.tokenizer = null;
        this.params = {};
    }

    async init() {
        Logger.log(`[Direct] Opening file (FD mode): ${this.filePath}`);
        
        // 1. Open File Descriptor
        this.fd = fs.openSync(this.filePath, 'r');
        
        // 2. Read Header (10MB is enough for metadata + vocab usually)
        const stats = fs.fstatSync(this.fd);
        const headerSize = Math.min(10 * 1024 * 1024, stats.size);
        this.headerBuffer = Buffer.allocUnsafe(headerSize);
        fs.readSync(this.fd, this.headerBuffer, 0, headerSize, 0);
        
        // 3. Load
        await this.loader.load(this.headerBuffer);
        
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
        
        Logger.log(`[Direct] Ready. Arch: ${this.params.arch}, Layers: ${this.params.n_layer}, Embd: ${this.params.n_embd}`);
    }

    resetContext() {
        this.kv_cache = [];
        this.history = [];
        if(global.gc) global.gc();
    }

    async getEmbedding(text) {
        let tokens = await this.tokenizer.tokenize(text);
        const backupCache = this.kv_cache;
        this.kv_cache = []; 
        let lastHidden = null;
        for (let i = 0; i < tokens.length; i++) {
            lastHidden = await this.model.forward(tokens[i], i);
        }
        this.kv_cache = backupCache;
        if (!lastHidden) return null;
        return this._l2Normalize(lastHidden);
    }

    _l2Normalize(vec) {
        let sum = 0.0;
        for (let i = 0; i < vec.length; i++) sum += vec[i] * vec[i];
        const mag = Math.sqrt(sum);
        if (mag === 0) return vec;
        const out = new Float32Array(vec.length);
        for (let i = 0; i < vec.length; i++) out[i] = vec[i] / mag;
        return out;
    }

    async generate(prompt, callback, options={}) {
        let fullPrompt = `<start_of_turn>user\n${prompt}<end_of_turn>\n<start_of_turn>model\n`;
        Logger.log(`[Direct] Formatted Prompt: ${JSON.stringify(fullPrompt)}`);
        
        let tokens = await this.tokenizer.tokenize(fullPrompt);
        
        if (this.params.arch.includes('gemma') && this.history.length === 0 && tokens[0] !== 2) {
             tokens.unshift(2); 
        }
        
        let lastHidden = null;
        
        Logger.log(`[Direct] Processing Context (${tokens.length} tokens)...`);
        for (let i = 0; i < tokens.length; i++) {
            lastHidden = await this.model.forward(tokens[i], this.history.length);
            this.history.push(tokens[i]);
            if (i % 5 === 0) process.stdout.write('.');
        }
        console.log('');
        
        Logger.log(`[Direct] Generating...`);
        const maxTokens = options.maxTokens || 128;
        
        for (let i = 0; i < maxTokens; i++) {
            const logits = this.model.computeLogits(lastHidden);
            const next = this.sample(logits);
            
            if (next === 1 || next === 106 || next === 107 || (next === 2 && this.history.length > 1)) {
                Logger.log(`[Direct] EOS Token generated.`);
                break; 
            }
            
            const word = await this.tokenizer.detokenize([next]);
            callback(word);
            
            this.history.push(next);
            lastHidden = await this.model.forward(next, this.history.length - 1);
        }
    }

    sample(logits) {
        let max = -Infinity, idx = 0;
        for(let i=0; i<logits.length; i++) {
            if(logits[i] > max) { max = logits[i]; idx = i; }
        }
        return idx;
    }
}

module.exports = DirectEngine;