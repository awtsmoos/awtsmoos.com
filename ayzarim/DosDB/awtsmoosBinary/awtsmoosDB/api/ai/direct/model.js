
// B"H
const Stats = require('../math/stats.js');
const Matrix = require('../math/matrix.js');
const Act = require('../math/act.js');
const Layers = require('./layers.js');
const Wasm = require('../math/wasm/jit.js');
const Tensors = require('./loader/tensors.js');

class Model {
    constructor(engine) {
        this.engine = engine;
        this.layers = new Layers(engine);
        this.pointer_cache = new Map();
    }

    async trace(opName, fn) {
        if (!this.engine.options.verbose) return await fn();
        const start = process.hrtime.bigint();
        const res = await fn();
        const end = process.hrtime.bigint();
        console.log(`    [Math] ${opName.padEnd(28)} | ${(Number(end - start) / 1e6).toFixed(3).padStart(8)}ms`);
        return res;
    }

    async forward(token_id, pos) {
        const params = this.engine.params;
        const loader = this.engine.loader;

        if (Wasm.exports) Wasm.resetScratch();

        let x = await this.trace(`Embedding [Token:${token_id}]`, async () => {
            const embInfo = loader.tensorMap.get('token_embd.weight') || loader.tensorMap.get('model.embed_tokens.weight');
            const fullEmb = await loader.getTensor(embInfo.name);
            const offset = token_id * params.n_embd;
            const vec = fullEmb.subarray(offset, offset + params.n_embd);
            const out = new Float32Array(vec); 
            if (params.useEmbScale) {
                const embScale = Math.sqrt(params.n_embd);
                for(let i=0; i<out.length; i++) out[i] *= embScale;
            }
            return out;
        });

        for (let l = 0; l < params.n_layer; l++) {
            x = await this.layers.forward(x, l, pos, this.trace.bind(this));
        }

        x = await this.trace("Final LayerNorm", async () => {
            let w_norm = await loader.getTensor(loader.globalTensorMap.output_norm);
            const res = w_norm ? Stats.rmsNorm(x, w_norm, params.norm_eps, params.norm_offset) : x;
            return res;
        });
        
        return x;
    }

    computeWasm(x, w, n_out, cacheKey) {
        if (!w) throw new Error(`B"H Model Error: Weights missing for ${cacheKey}`);
        const n_in = (x._wasmPtr !== undefined) ? x._wasmLon : x.length;
        if (!Wasm.exports) return Matrix.matVecMul(x, w, n_out);

        let entry = this.pointer_cache.get(cacheKey);
        if (!entry) {
            const w_ptr = Wasm.uploadF32(w);
            const out_ptr = Wasm.allocPermanent(n_out * 4);
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
            x_ptr = Wasm.allocScratch(needed);
            Wasm.copyIn(x_ptr, x);
        }

        Wasm.exports.matVecMul(entry.out_ptr, x_ptr, entry.w_ptr, n_out, n_in);
        return Wasm.view(entry.out_ptr, n_out);
    }

    async computeLogits(hidden) {
        return await this.trace("Output Logit Projection", async () => {
            const loader = this.engine.loader;
            const w_out_name = loader.globalTensorMap.output || loader.globalTensorMap.embed;
            const info = loader.tensorMap.get(w_out_name);
            
            if (Wasm.exports && info.type === 2) { 
                const qTensor = await loader.getQuantizedTensor(w_out_name);
                if (qTensor) {
                    let entry = this.pointer_cache.get('FINAL_LOGITS_Q');
                    if (!entry) {
                        const s_ptr = Wasm.uploadF32(qTensor.scales);
                        const q_ptr = Wasm.uploadU8(qTensor.quants);
                        const out_ptr = Wasm.allocPermanent(qTensor.n_out * 4);
                        entry = { s_ptr, q_ptr, out_ptr, n_out: qTensor.n_out, n_blocks: qTensor.n_in / 32 };
                        this.pointer_cache.set('FINAL_LOGITS_Q', entry);
                    }
                    let x_ptr;
                    if (hidden._wasmPtr !== undefined) x_ptr = hidden._wasmPtr;
                    else { x_ptr = Wasm.allocScratch(hidden.length * 4); Wasm.copyIn(x_ptr, hidden); }
                    
                    Wasm.exports.matVecMul_q4_0(entry.out_ptr, x_ptr, entry.q_ptr, entry.s_ptr, entry.n_out, entry.n_blocks);
                    const logits = Wasm.view(entry.out_ptr, entry.n_out);
                    return (this.engine.params.final_soft_cap > 0) ? Act.softCap(logits, this.engine.params.final_soft_cap) : logits;
                }
            }

            const w = await loader.getTensor(w_out_name);
            const logits = this.computeWasm(hidden, w, this.engine.vocab.length, 'FINAL_LOGITS');
            const capped = (this.engine.params.final_soft_cap > 0) ? Act.softCap(logits, this.engine.params.final_soft_cap) : logits;
            return capped;
        });
    }
}

module.exports = Model;
