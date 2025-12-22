// B"H
const Stats = require('../math/stats.js');
const Matrix = require('../math/matrix.js');
const Act = require('../math/act.js');
const Layers = require('./layers.js');
const Logger = require('../utils/logger.js');
const Wasm = require('../math/wasm_jit.js');

class Model {
    constructor(engine) {
        this.engine = engine;
        this.layers = new Layers(engine);
        
        // B"H: Initialize to -1 because WASM pointers can be 0
        this.wasm_w_out_ptr = -1;
        this.wasm_out_buffer_ptr = -1;
        this.wasm_x_ptr = -1;
    }

    async forward(token_id, pos) {
        const stats = this.engine.params;
        const loader = this.engine.loader;

        // Embedding
        const embInfo = loader.tensorMap.get('token_embd.weight') || loader.tensorMap.get('model.embed_tokens.weight');
        if (!embInfo) throw new Error("Embedding Missing");
        
        let x = loader.getTensor(embInfo.name, token_id * stats.n_embd, stats.n_embd);
        if (!x) throw new Error("Embedding Missing for ID: " + token_id);

        if (stats.useEmbScale) {
            const embScale = Math.sqrt(stats.n_embd);
            for(let i=0; i<x.length; i++) x[i] *= embScale;
        }

        // Layers
        for (let l = 0; l < stats.n_layer; l++) {
            x = this.layers.forward(x, l, pos);
        }

        // Final Norm
        let w_norm = loader.getTensor(loader.globalTensorMap.output_norm);
        if (w_norm) {
            x = Stats.rmsNorm(x, w_norm, stats.norm_eps, 0.0);
        }
        
        return x;
    }

    computeLogits(hidden) {
        const stats = this.engine.params;
        const loader = this.engine.loader;
        
        const w_out_name = loader.globalTensorMap.output || loader.globalTensorMap.embed;
        
        // --- WASM ACCELERATION ---
        if (Wasm.instance) {
            // B"H: Correct check for uninitialized pointer
            if (this.wasm_w_out_ptr === -1) {
                Logger.log(`[WASM] Uploading Output Weights to GPU/WASM Heap...`);
                // Force full load of weights
                const w_out = loader.getTensor(w_out_name);
                this.wasm_w_out_ptr = Wasm.uploadF32(w_out);
                
                // Pre-allocate output buffer in WASM
                const vocabSize = this.engine.vocab.length;
                this.wasm_out_buffer_ptr = Wasm.alloc(vocabSize * 4);
                this.wasm_x_ptr = Wasm.alloc(hidden.length * 4);
            }

            const vocabSize = this.engine.vocab.length;
            const n_embd = hidden.length;

            // 1. Copy hidden state (small, fast)
            Wasm.heapF32.set(hidden, this.wasm_x_ptr >> 2);

            // 2. Run Kernel
            Wasm.fn(
                this.wasm_out_buffer_ptr, 
                this.wasm_x_ptr, 
                this.wasm_w_out_ptr, 
                vocabSize, 
                n_embd
            );

            // 3. Read result
            const logits = Wasm.heapF32.slice(
                this.wasm_out_buffer_ptr >> 2, 
                (this.wasm_out_buffer_ptr >> 2) + vocabSize
            );

            if (stats.final_soft_cap > 0) {
                const cap = stats.final_soft_cap;
                const invCap = 1.0 / cap;
                for(let i=0; i<logits.length; i++) {
                    logits[i] = cap * Math.tanh(logits[i] * invCap);
                }
            }
            return logits;
        }
        // --- END WASM ---

        // Fallback to JS
        const w_out = loader.getTensor(w_out_name);
        const vocabSize = this.engine.vocab.length;
        const logits = Matrix.matVecMul(hidden, w_out, vocabSize);

        if (stats.final_soft_cap > 0) {
            const cap = stats.final_soft_cap;
            const invCap = 1.0 / cap;
            for(let i=0; i<logits.length; i++) {
                logits[i] = cap * Math.tanh(logits[i] * invCap);
            }
        }
        
        return logits;
    }
}

module.exports = Model;