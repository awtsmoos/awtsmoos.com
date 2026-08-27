
// B"H
/**
 * @file generator.js
 * @description Encapsulates the Token Generation Loop logic.
 */
const Wasm = require('../math/wasm/jit.js');

class Generator {
    constructor(engine) {
        this.engine = engine;
    }

    async generate(prompt, callback, options={}) {
        const tokenizer = this.engine.tokenizer;
        const model = this.engine.model;
        
        let fullPrompt = `<start_of_turn>user\n${prompt.trim()}<end_of_turn>\n<start_of_turn>model\n`;
        let tokens = await tokenizer.tokenize(fullPrompt);
        
        const isGemma = this.engine.params.arch.includes('gemma');
        const bosId = isGemma ? 2 : 1;
        if (this.engine.history.length === 0 && tokens[0] !== bosId) tokens.unshift(bosId);
        
        let lastHidden = null;
        for (let i = 0; i < tokens.length; i++) {
            lastHidden = await model.forward(tokens[i], this.engine.history.length);
            this.engine.history.push(tokens[i]);
        }
        
        const maxTokens = options.maxTokens || 128;
        for (let i = 0; i < maxTokens; i++) {
            const start = process.hrtime.bigint();
            const logits = await model.computeLogits(lastHidden);
            const next_id = await this.sample(logits, this.engine.history, { temp: 0.8, top_p: 0.9, ...options });
            
            if (next_id === 1 || next_id === 106 || next_id === 107) break;
            
            const word = await tokenizer.detokenize([next_id]);
            const ms = (Number(process.hrtime.bigint() - start) / 1e6).toFixed(2);
            if (options.streamTimestamps) console.log(`[Token] ${JSON.stringify(word)} ${ms}ms`);
            if (callback) callback(word);
            
            this.engine.history.push(next_id);
            lastHidden = await model.forward(next_id, this.engine.history.length - 1);
        }
    }

    async getEmbedding(text) {
         const tokenizer = this.engine.tokenizer;
         const model = this.engine.model;
         let tokens = await tokenizer.tokenize(text);
         this.engine.resetContext(); 
         let lastHidden = null;
         for(let t of tokens) {
             lastHidden = await model.forward(t, this.engine.history.length);
             this.engine.history.push(t);
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

module.exports = Generator;
