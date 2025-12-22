
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
        
        // State
        this.kv_cache = [];
        this.history = [];
        this.buffer = null;
        this.metadata = null;
        this.vocab = [];
        this.tokenizer = null;
        this.params = {};
    }

    async init() {
        Logger.log(`[Direct] Reading file: ${this.filePath}`);
        this.buffer = fs.readFileSync(this.filePath);
        
        await this.loader.load(this.buffer);
        
        // Mock handle for Tokenizer
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
        // B"H: Scores might be missing in some GGUFs, handle gracefully
        this.tokenizer.scores = this.loader.scores ? new Float32Array(this.loader.scores) : new Float32Array(this.vocab.length).fill(0);
        
        await this.tokenizer.init(); 
        
        // Debug Vocab
        if (this.vocab.length > 100) {
            const sos = '<start_of_turn>';
            const idx = this.vocab.indexOf(sos);
            Logger.log(`[Vocab] ID 105: '${this.vocab[105]}', SOS Index: ${idx}`);
        }

        Logger.log(`[Direct] Ready. Arch: ${this.params.arch}, Layers: ${this.params.n_layer}, Embd: ${this.params.n_embd}`);
    }

    async generate(prompt, callback) {
        // B"H - The prompt now includes all necessary formatting from the test file.
        let fullPrompt = `<start_of_turn>user\n${prompt}<end_of_turn>\n<start_of_turn>model\n`;
        Logger.log(`[Direct] Formatted Prompt: ${JSON.stringify(fullPrompt)}`);
        
        let tokens = await this.tokenizer.tokenize(fullPrompt);
        
        // Gemma 3: Ensure BOS (2) if start of session
        if (this.params.arch.includes('gemma') && this.history.length === 0 && tokens[0] !== 2) {
             tokens.unshift(2); // BOS
             Logger.log(`[Direct] Added BOS (2) at start.`);
        }
        
        let lastHidden = null;
        
        // Context
        Logger.log(`[Direct] Processing Context (${tokens.length} tokens)...`);
        for (let i = 0; i < tokens.length; i++) {
            lastHidden = await this.model.forward(tokens[i], this.history.length);
            this.history.push(tokens[i]);
            
            if (i % 2 === 0) process.stdout.write('.');
        }
        console.log(''); // Newline after dots
        
        // Gen
        Logger.log(`[Direct] Generating...`);
        for (let i = 0; i < 128; i++) { // Increased generation length
            const logits = this.model.computeLogits(lastHidden);
            const next = this.sample(logits);
            
            // Handle EOS
            if (next === 1 || next === 106 || next === 107 || next === 2) {
                Logger.log(`[Direct] EOS Token generated (${next}).`);
                break; 
            }
            
            const word = await this.tokenizer.detokenize([next]);
            callback(word);
            
            this.history.push(next);
            lastHidden = await this.model.forward(next, this.history.length - 1);
        }
    }

    sample(logits) {
        // Greedy for now to debug
        let max = -Infinity, idx = 0;
        for(let i=0; i<logits.length; i++) {
            if(logits[i] > max) { max = logits[i]; idx = i; }
        }
        return idx;
    }
}

module.exports = DirectEngine;
