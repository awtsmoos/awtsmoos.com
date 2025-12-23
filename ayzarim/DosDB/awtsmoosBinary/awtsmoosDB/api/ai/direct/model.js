// B"H
const Stats = require('../math/stats.js');
const Matrix = require('../math/matrix.js');
const Act = require('../math/act.js');
const Layers = require('./layers.js');
const Wasm = require('../math/wasm_jit.js');

class Model {
    constructor(engine) {
        this.engine = engine;
        this.layers = new Layers(engine);
        this.pointer_cache = new Map();
        this.shared_input_ptr = -1;
        this.shared_input_size = 0;
    }

    // B"H: Debug Helper - SHUTDOWN ON NAN
    debugCheck(name, tensor) {
        if (!tensor) {
            console.log(`B"H [DEBUG] ${name}: NULL/UNDEFINED`);
            return;
        }
        let data = tensor;
        if (tensor._wasmPtr !== undefined) {
            data = Wasm.copyOut(tensor);
        }
        
        let hasNaN = false;
        
        // Fast scan
        for(let i=0; i<data.length; i++) {
            if (Number.isNaN(data[i]) || !Number.isFinite(data[i])) { 
                hasNaN = true; 
                break; 
            }
        }
        
        if (hasNaN) {
            const msg = `B"H [CRITICAL] ${name}: NaN/Inf DETECTED! Len=${data.length}. SHUTTING DOWN.`;
            console.error(msg);
            throw new Error(msg); // Hard Stop
        }
    }

    trace(opName, fn) {
        const start = process.hrtime.bigint();
        const res = fn();
        const end = process.hrtime.bigint();
        if (this.engine.options.verbose) {
            console.log(`    [Math] ${opName.padEnd(28)} | ${(Number(end - start) / 1e6).toFixed(3).padStart(8)}ms`);
        }
        return res;
    }

    async forward(token_id, pos) {
        const stats = this.engine.params;
        const loader = this.engine.loader;

        let x = this.trace(`Embedding [Token:${token_id}]`, () => {
            const embInfo = loader.tensorMap.get('token_embd.weight') || loader.tensorMap.get('model.embed_tokens.weight');
            let vec = loader.getTensor(embInfo.name, token_id * stats.n_embd, stats.n_embd);
            
            this.debugCheck("Embedding_Raw", vec);
            
            if (stats.useEmbScale) {
                const embScale = Math.sqrt(stats.n_embd);
                for(let i=0; i<vec.length; i++) vec[i] *= embScale;
            }
            return vec;
        });
        
        this.debugCheck("Embedding_Scaled", x);

        for (let l = 0; l < stats.n_layer; l++) {
            x = this.layers.forward(x, l, pos, this.trace.bind(this));
            this.debugCheck(`Layer_${l}_Output`, x);
        }

        x = this.trace("Final LayerNorm", () => {
            let w_norm = loader.getTensor(loader.globalTensorMap.output_norm);
            return w_norm ? Stats.rmsNorm(x, w_norm, stats.norm_eps) : x;
        });
        
        this.debugCheck("Final_Norm", x);
        
        return x;
    }

    computeWasm(x, w, n_out, cacheKey) {
        if (!w) throw new Error(`B"H Model Error: Weights missing for ${cacheKey}`);
        
        const n_in = (x._wasmPtr !== undefined) ? x._wasmLon : x.length;
        
        // B"H: Dimension Safety Check
        if (w.length < n_out * n_in) {
            // Note: If using quantized weights (e.g. Q4_0), w.length is bytes, not floats.
            // But here w is likely Float32Array from loader.
            // If it's Float32Array, exact match required.
            if (w instanceof Float32Array && w.length !== n_out * n_in) {
                 // Relax check for potential padding, but ensure MINIMUM size
                 if (w.length < n_out * n_in) {
                     throw new Error(`B"H Dimension Mismatch [${cacheKey}]: Input=${n_in}, Output=${n_out}, Expected=${n_in*n_out}, Actual=${w.length}`);
                 }
            }
        }

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

    computeLogits(hidden) {
        return this.trace("Output Logit Projection", () => {
            const loader = this.engine.loader;
            const w_out_name = loader.globalTensorMap.output || loader.globalTensorMap.embed;
            const logits = this.computeWasm(hidden, loader.getTensor(w_out_name), this.engine.vocab.length, 'FINAL_LOGITS');
            
            this.debugCheck("Raw_Logits", logits);
            
            const capped = (this.engine.params.final_soft_cap > 0) ? Act.softCap(logits, this.engine.params.final_soft_cap) : logits;
            
            return capped;
        });
    }
}

module.exports = Model;