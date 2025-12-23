// B"H
const Stats = require('../math/stats.js');
const Matrix = require('../math/matrix.js');
const Rope = require('../math/rope.js');
const Act = require('../math/act.js');
const Wasm = require('../math/wasm_jit.js');

class Layers {
    constructor(engine) {
        this.engine = engine;
    }
    
    debug(name, t) {
        if(this.engine.model.debugCheck) this.engine.model.debugCheck(name, t);
    }

    safeCompute(x, w, out_dim, name) {
        // Compute WASM
        const res = this.engine.model.computeWasm(x, w, out_dim, name);
        
        // B"H: Optimization - Only check the first value for NaN as a heuristic
        // This avoids full array scanning in the hot path.
        // WASM errors usually corrupt the whole block.
        let checkVal = (res._wasmPtr !== undefined) ? Wasm.heapF32[res._wasmPtr >> 2] : res[0];
        
        if (isNaN(checkVal)) {
            return this._fallbackCompute(x, w, out_dim, name);
        }
        return res;
    }
    
    _fallbackCompute(x, w, out_dim, name) {
        const x_js = (x._wasmPtr !== undefined) ? Wasm.copyOut(x) : x;
        if (!w) throw new Error(`B"H [Healing] Weights missing for ${name}`);
        
        const fallbackRes = Matrix.matVecMul(x_js, w, out_dim);
        
        if (isNaN(fallbackRes[0])) {
            console.error(`B"H [CRITICAL] NaN in ${name}.`);
            throw new Error(`Persistent NaN in ${name}`);
        }
        
        return fallbackRes;
    }

    forward(x, l, pos, trace) {
        const p = this.engine.params;
        const loader = this.engine.loader;
        
        // 1. Attention Block
        this.traceBlock(trace, `L${l} Attention Block`, () => {
            let attn_norm_w = loader.getLayerWeight(l, 'attn_norm');
            let x_norm = Stats.rmsNorm(x, attn_norm_w, p.norm_eps);
            // this.debug(`L${l}_Attn_Norm`, x_norm);
            
            let attn_out = this.computeAttention(x_norm, l, p, loader, pos);
            // this.debug(`L${l}_Attn_Raw_Out`, attn_out);
            
            let w_post_attn = loader.getLayerWeight(l, 'attn_post_norm');
            if (w_post_attn) {
                attn_out = Stats.rmsNorm(attn_out, w_post_attn, p.norm_eps);
            }
            
            const addVal = (attn_out._wasmPtr !== undefined) ? Wasm.copyOut(attn_out) : attn_out;
            Matrix.addInPlace(x, addVal);
        });
        
        // 2. Feed-Forward Block
        this.traceBlock(trace, `L${l} FFN Block`, () => {
            let ffn_norm_w = loader.getLayerWeight(l, 'ffn_norm');
            let x_ffn_norm = Stats.rmsNorm(x, ffn_norm_w, p.norm_eps);
            
            let ffn_out = this.computeFFN(x_ffn_norm, l, p, loader);
            // this.debug(`L${l}_FFN_Raw_Out`, ffn_out);
            
            let w_post_ffn = loader.getLayerWeight(l, 'ffn_post_norm');
            if (w_post_ffn) {
                ffn_out = Stats.rmsNorm(ffn_out, w_post_ffn, p.norm_eps);
            }
            
            const addVal = (ffn_out._wasmPtr !== undefined) ? Wasm.copyOut(ffn_out) : ffn_out;
            Matrix.addInPlace(x, addVal);
        });
        
        return x;
    }

    traceBlock(trace, name, fn) {
        return trace(name, fn);
    }

    computeAttention(x, l, params, loader, pos) {
        let q_w = loader.getLayerWeight(l, 'attn_q');
        let k_w = loader.getLayerWeight(l, 'attn_k');
        let v_w = loader.getLayerWeight(l, 'attn_v');
        
        let q = this.safeCompute(x, q_w, params.q_dim, `L${l}_Q`);
        let k = this.safeCompute(x, k_w, params.kv_dim, `L${l}_K`);
        let v = this.safeCompute(x, v_w, params.kv_dim, `L${l}_V`);
        
        if (params.arch.includes('gemma')) {
             let w_qn = loader.getLayerWeight(l, 'attn_q_norm');
             let w_kn = loader.getLayerWeight(l, 'attn_k_norm');
             
             if (w_qn) {
                 const q_js = (q._wasmPtr !== undefined) ? Wasm.copyOut(q) : q;
                 const isShared = w_qn.length === params.head_dim;
                 
                 for (let h = 0; h < params.n_head; h++) {
                     const start = h * params.head_dim;
                     const chunk = q_js.subarray(start, start + params.head_dim);
                     // B"H: Correctly handle shared vs per-head weights
                     const w_chunk = isShared ? w_qn : w_qn.subarray(start, start + params.head_dim);
                     const normed = Stats.rmsNorm(chunk, w_chunk, params.norm_eps);
                     q_js.set(normed, start);
                 }
                 q = q_js;
             }
             
             if (w_kn) {
                 const k_js = (k._wasmPtr !== undefined) ? Wasm.copyOut(k) : k;
                 const isShared = w_kn.length === params.head_dim;
                 
                 for (let h = 0; h < params.n_head_kv; h++) {
                     const start = h * params.head_dim;
                     const chunk = k_js.subarray(start, start + params.head_dim);
                     // B"H: Correctly handle shared vs per-head weights
                     const w_chunk = isShared ? w_kn : w_kn.subarray(start, start + params.head_dim);
                     const normed = Stats.rmsNorm(chunk, w_chunk, params.norm_eps);
                     k_js.set(normed, start);
                 }
                 k = k_js;
             }
        }
        
        // B"H: RoPE
        const q_r = Rope.rope(q, params.head_dim, pos, params.rope_freq, params.rope_scale);
        const k_r = Rope.rope(k, params.head_dim, pos, params.rope_freq, params.rope_scale);

        if (!this.engine.kv_cache[l]) this.engine.kv_cache[l] = { k: [], v: [] };
        
        // B"H: Ensure KV cache stores clean arrays
        this.engine.kv_cache[l].k[pos] = q_r.constructor === Float32Array ? k_r : new Float32Array(k_r);
        this.engine.kv_cache[l].v[pos] = (v._wasmPtr !== undefined) ? Wasm.copyOut(v) : v;

        let scale = 1.0 / Math.sqrt(params.head_dim);
        const out_attn = new Float32Array(params.q_dim);
        const ratio = (params.n_head / params.n_head_kv) | 0;
        
        // B"H: Use Act.fastTanh for soft capping if available
        const useSoftCap = params.attn_soft_cap > 0;
        const softCapVal = params.attn_soft_cap;
        
        for (let h = 0; h < params.n_head; h++) {
            const h_off = h * params.head_dim;
            const kv_h = (h / ratio) | 0;
            const kv_off = kv_h * params.head_dim; 
            const scores = new Float32Array(pos + 1);
            
            for (let i = 0; i <= pos; i++) {
                let score = Matrix.dotProductChunk(q_r, h_off, this.engine.kv_cache[l].k[i], kv_off, params.head_dim) * scale;
                
                if (useSoftCap) {
                    score = softCapVal * Math.tanh(score / softCapVal);
                }
                
                scores[i] = score;
            }

            const probs = Stats.softmax(scores);
            this._fallbackSum(out_attn, probs, l, kv_off, h_off, pos, params);
        }
        
        let attn_proj_w = loader.getLayerWeight(l, 'attn_out');
        return this.safeCompute(out_attn, attn_proj_w, params.n_embd, `L${l}_OUT`);
    }

    _fallbackSum(out_attn, probs, l, kv_off, h_off, pos, params) {
        for (let i = 0; i <= pos; i++) {
            const val = probs[i];
            const v_full = this.engine.kv_cache[l].v[i];
            for (let j = 0; j < params.head_dim; j++) out_attn[h_off + j] += val * v_full[kv_off + j];
        }
    }

    computeFFN(x, l, params, loader) {
        let w_g = loader.getLayerWeight(l, 'ffn_gate');
        let w_u = loader.getLayerWeight(l, 'ffn_up');
        let w_d = loader.getLayerWeight(l, 'ffn_down');
        
        const n_ff = w_g.length / params.n_embd;
        
        const gate = this.safeCompute(x, w_g, n_ff, `L${l}_FFN_G`);
        const up = this.safeCompute(x, w_u, n_ff, `L${l}_FFN_U`);
        
        const act = (params.act_fn === 'gelu') ? Act.gelu(gate) : Stats.silu(gate);
        const up_js = (up._wasmPtr !== undefined) ? Wasm.copyOut(up) : up;
        const act_mul = Matrix.mul(act, up_js);
        
        return this.safeCompute(act_mul, w_d, params.n_embd, `L${l}_FFN_D`);
    }
}

module.exports = Layers;