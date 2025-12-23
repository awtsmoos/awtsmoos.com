
// B"H
const Stats = require('../math/stats.js');
const Matrix = require('../math/matrix.js');
const Act = require('../math/act.js');
const Layers = require('./layers.js');
const Wasm = require('../math/wasm_jit.js');

/**
 * B"H
 * The Model Vessel.
 * Coordinates the flow of light through the layers.
 */
class Model {
    constructor(engine) {
        this.engine = engine;
        this.layers = new Layers(engine);
        this.pointer_cache = new Map();
        this.shared_input_ptr = -1;
        this.shared_input_size = 0;
    }

    /**
     * B"H
     * Debug Helper - Ensures the signal hasn't collapsed into the void of NaN.
     */
    debugCheck(name, tensor) {
        if (!tensor) return;
        let data = tensor;
        if (tensor._wasmPtr !== undefined) {
            data = Wasm.copyOut(tensor);
        }
        
        for(let i=0; i<data.length; i++) {
            if (!Number.isFinite(data[i])) { 
                const msg = `B"H [CRITICAL] ${name}: Signal Collapse (NaN/Inf) at index ${i}!`;
                console.error(msg);
                throw new Error(msg); 
            }
        }
    }

    /**
     * B"H
     * Measures the time of creation for a specific operation.
     */
    trace(opName, fn) {
        const start = process.hrtime.bigint();
        const res = fn();
        const end = process.hrtime.bigint();
        if (this.engine.options.verbose) {
            console.log(`    [Math] ${opName.padEnd(28)} | ${(Number(end - start) / 1e6).toFixed(3).padStart(8)}ms`);
        }
        return res;
    }

    /**
     * B"H
     * Propagates a single token through the entire network.
     */
    async forward(token_id, pos) {
        const params = this.engine.params;
        const loader = this.engine.loader;

        let x = this.trace(`Embedding [Token:${token_id}]`, () => {
            const embInfo = loader.tensorMap.get('token_embd.weight') || loader.tensorMap.get('model.embed_tokens.weight');
            // B"H - CRITICAL: Never modify weights in-place. Copy them into a fresh vessel.
            const rawVec = loader.getTensor(embInfo.name, token_id * params.n_embd, params.n_embd);
            const vec = new Float32Array(rawVec); 
            
            if (params.useEmbScale) {
                const embScale = Math.sqrt(params.n_embd);
                for(let i=0; i<vec.length; i++) vec[i] *= embScale;
            }
            return vec;
        });

        for (let l = 0; l < params.n_layer; l++) {
            x = this.layers.forward(x, l, pos, this.trace.bind(this));
            
            // B"H: If x is a Wasm view, we must copy it out to ensure subsequent 
            // Wasm memory growth doesn't detach the view.
            if (x._wasmPtr !== undefined) {
                 x = Wasm.copyOut(x);
            }
        }

        // Final normalization and projection
        x = this.trace("Final LayerNorm", () => {
            let w_norm = loader.getTensor(loader.globalTensorMap.output_norm);
            const res = w_norm ? Stats.rmsNorm(x, w_norm, params.norm_eps, params.norm_offset) : x;
            return (res._wasmPtr !== undefined) ? Wasm.copyOut(res) : res;
        });
        
        return x;
    }

    /**
     * B"H
     * Bridges the JS hidden state to the Wasm matVecMul kernel.
     */
    computeWasm(x, w, n_out, cacheKey) {
        if (!w) throw new Error(`B"H Model Error: Weights missing for ${cacheKey}`);
        
        const n_in = (x._wasmPtr !== undefined) ? x._wasmLon : x.length;
        
        if (!Wasm.exports) return Matrix.matVecMul(x, w, n_out);

        let entry = this.pointer_cache.get(cacheKey);
        if (!entry) {
            const w_ptr = Wasm.uploadF32(w);
            const out_ptr = Wasm.alloc(n_out * 4);
            entry = { w_ptr, out_ptr };
            this.pointer_cache.set(cacheKey, entry);
        }

        let x_ptr;
        if (x._wasmPtr !== undefined) {
            x_ptr = x._wasmPtr;
        } else if (x.buffer === Wasm.memory.buffer) {
            x_ptr = x.byteOffset;
        } else {
            const needed = n_in * 4;
            if (this.shared_input_ptr === -1 || this.shared_input_size < needed) {
                this.shared_input_ptr = Wasm.alloc(needed + 256);
                this.shared_input_size = needed + 256;
            }
            Wasm.copyIn(this.shared_input_ptr, x);
            x_ptr = this.shared_input_ptr;
        }

        Wasm.exports.matVecMul(entry.out_ptr, x_ptr, entry.w_ptr, n_out, n_in);
        return Wasm.view(entry.out_ptr, n_out);
    }

    /**
     * B"H
     * Converts the final hidden state into probabilities over the vocabulary.
     */
    computeLogits(hidden) {
        return this.trace("Output Logit Projection", () => {
            const loader = this.engine.loader;
            const w_out_name = loader.globalTensorMap.output || loader.globalTensorMap.embed;
            const logits = this.computeWasm(hidden, loader.getTensor(w_out_name), this.engine.vocab.length, 'FINAL_LOGITS');
            
            const capped = (this.engine.params.final_soft_cap > 0) ? Act.softCap(logits, this.engine.params.final_soft_cap) : logits;
            return capped;
        });
    }
}

module.exports = Model;
