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
        
        // Output Projection pointers
        this.wasm_w_out_ptr = -1;
        this.wasm_out_buffer_ptr = -1;
        this.wasm_x_ptr = -1;

        // Layer Weights Cache (Map<String Key, Number Pointer>)
        this.wasm_cache = new Map();
        
        // Shared Scratch Buffers for Layers to reduce allocation overhead
        this.shared_input_ptr = -1;
        this.shared_input_size = 0;
        this.shared_output_ptr = -1;
        this.shared_output_size = 0;
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

    // B"H: New Optimized Executor for Layers
    computeWasm(x, w, n_out, cacheKey) {
        // Fallback if WASM failed to init or weights are missing
        if (!Wasm.instance || !w) {
            return Matrix.matVecMul(x, w, n_out);
        }

        try {
            const n_in = x.length;

            // 1. Prepare Weights (Cache them)
            let w_ptr = this.wasm_cache.get(cacheKey);
            if (w_ptr === undefined) {
                // First time seeing this layer weight? Upload it.
                // Note: This happens once per layer per session.
                w_ptr = Wasm.uploadF32(w);
                if (w_ptr === 0 && w.length > 0) {
                    // OOM protection
                    this.wasm_cache.set(cacheKey, -1); // Mark as failed
                    return Matrix.matVecMul(x, w, n_out);
                }
                this.wasm_cache.set(cacheKey, w_ptr);
            }

            // If previously failed to upload, fallback
            if (w_ptr === -1) return Matrix.matVecMul(x, w, n_out);

            // 2. Prepare Input Buffer (Shared/Growing)
            const inputSizeNeeded = n_in * 4;
            if (this.shared_input_ptr === -1 || this.shared_input_size < inputSizeNeeded) {
                // Align to 32 bytes for safety
                this.shared_input_ptr = Wasm.alloc(inputSizeNeeded + 32);
                this.shared_input_size = inputSizeNeeded + 32;
            }
            Wasm.heapF32.set(x, this.shared_input_ptr >> 2);

            // 3. Prepare Output Buffer (Shared/Growing)
            const outputSizeNeeded = n_out * 4;
            if (this.shared_output_ptr === -1 || this.shared_output_size < outputSizeNeeded) {
                this.shared_output_ptr = Wasm.alloc(outputSizeNeeded + 32);
                this.shared_output_size = outputSizeNeeded + 32;
            }

            // 4. Run Kernel
            Wasm.fn(
                this.shared_output_ptr,
                this.shared_input_ptr,
                w_ptr,
                n_out,
                n_in
            );

            // 5. Retrieve Result
            return Wasm.heapF32.slice(
                this.shared_output_ptr >> 2,
                (this.shared_output_ptr >> 2) + n_out
            );

        } catch (e) {
            // Safety Net: Any error in WASM logic falls back to JS immediately
            // console.warn("WASM Layer Error, falling back to JS:", e.message);
            return Matrix.matVecMul(x, w, n_out);
        }
    }

    computeLogits(hidden) {
        const stats = this.engine.params;
        const loader = this.engine.loader;
        
        const w_out_name = loader.globalTensorMap.output || loader.globalTensorMap.embed;
        
        // --- WASM ACCELERATION (Output Layer) ---
        if (Wasm.instance) {
            if (this.wasm_w_out_ptr === -1) {
                Logger.log(`[WASM] Uploading Output Weights to GPU/WASM Heap...`);
                const w_out = loader.getTensor(w_out_name);
                this.wasm_w_out_ptr = Wasm.uploadF32(w_out);
                
                const vocabSize = this.engine.vocab.length;
                this.wasm_out_buffer_ptr = Wasm.alloc(vocabSize * 4);
                this.wasm_x_ptr = Wasm.alloc(hidden.length * 4);
            }

            // Check if upload succeeded (ptr could be 0, which is valid, but -1 is our init state)
            // Actually, allocator returns 0 as valid. 
            // We only fallback if uploadF32 failed (which we can catch if we want, but let's assume it works for output).
            
            const vocabSize = this.engine.vocab.length;
            const n_embd = hidden.length;

            Wasm.heapF32.set(hidden, this.wasm_x_ptr >> 2);

            Wasm.fn(
                this.wasm_out_buffer_ptr, 
                this.wasm_x_ptr, 
                this.wasm_w_out_ptr, 
                vocabSize, 
                n_embd
            );

            const logits = Wasm.heapF32.slice(
                this.wasm_out_buffer_ptr >> 2, 
                (this.wasm_out_buffer_ptr >> 2) + vocabSize
            );

            if (stats.final_soft_cap > 0) {
                const cap = stats.final_soft_cap;
                const invCap = 1.0 / cap;
                for(let i=0; i<logits.length; i++) logits[i] = cap * Math.tanh(logits[i] * invCap);
            }
            return logits;
        }

        // Fallback
        const w_out = loader.getTensor(w_out_name);
        const vocabSize = this.engine.vocab.length;
        const logits = Matrix.matVecMul(hidden, w_out, vocabSize);

        if (stats.final_soft_cap > 0) {
            const cap = stats.final_soft_cap;
            const invCap = 1.0 / cap;
            for(let i=0; i<logits.length; i++) logits[i] = cap * Math.tanh(logits[i] * invCap);
        }
        
        return logits;
    }
}

module.exports = Model;