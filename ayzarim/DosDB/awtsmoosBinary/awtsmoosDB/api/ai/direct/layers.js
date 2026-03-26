
// B"H
const Stats = require('../math/stats.js');
const Matrix = require('../math/matrix.js');
const Rope = require('../math/rope.js');
const Act = require('../math/act.js');
const Wasm = require('../math/wasm/jit.js');

class Layers {
    constructor(engine) {
        this.engine = engine;
    }
    
    safeCompute(x, w, out_dim, name) {
        if (Wasm.exports) {
            const res = this.engine.model.computeWasm(x, w, out_dim, name);
            if (Wasm.isValid(res)) return res;
        }
        return this._fallbackCompute(x, w, out_dim, name);
    }
    
    _fallbackCompute(x, w, out_dim, name) {
        const x_js = (x._wasmPtr !== undefined) ? Wasm.copyOut(x) : x;
        if (!w) throw new Error(`B"H [Healing] Weights missing for ${name}`);
        const fallbackRes = Matrix.matVecMul(x_js, w, out_dim);
        return fallbackRes;
    }

    async forward(x, l, pos, trace) {
        const params = this.engine.params;
        const loader = this.engine.loader;

        let x_norm = await trace(`L${l} Pre-Attn Norm`, async () => {
            const w_norm = await loader.getLayerWeight(l, 'attn_norm');
            return Stats.rmsNorm(x, w_norm, params.norm_eps, params.norm_offset);
        });

        let attn_out = await trace(`L${l} Attention`, async () => {
            return await this.computeAttention(x_norm, l, pos, params, loader);
        });

        let sa_out = await trace(`L${l} Post-Attn Norm`, async () => {
            const w_post = await loader.getLayerWeight(l, 'attn_post_norm');
            if (w_post) {
                attn_out = Stats.rmsNorm(attn_out, w_post, params.norm_eps, params.norm_offset);
            }
            Matrix.addInPlace(x, attn_out);
            return x;
        });

        let x_ffn_norm = await trace(`L${l} Pre-FFN Norm`, async () => {
            const w_ffn_norm = await loader.getLayerWeight(l, 'ffn_norm');
            return Stats.rmsNorm(sa_out, w_ffn_norm, params.norm_eps, params.norm_offset);
        });

        let ffn_out = await trace(`L${l} FFN`, async () => {
            return await this.computeFFN(x_ffn_norm, l, params, loader);
        });

        return await trace(`L${l} Post-FFN Norm`, async () => {
            const w_ffn_post = await loader.getLayerWeight(l, 'ffn_post_norm');
            if (w_ffn_post) {
                ffn_out = Stats.rmsNorm(ffn_out, w_ffn_post, params.norm_eps, params.norm_offset);
            }
            Matrix.addInPlace(x, ffn_out);
            return x;
        });
    }

    async computeAttention(x, l, pos, params, loader) {
        const q_w = await loader.getLayerWeight(l, 'attn_q');
        const k_w = await loader.getLayerWeight(l, 'attn_k');
        const v_w = await loader.getLayerWeight(l, 'attn_v');

        let q = this.safeCompute(x, q_w, params.q_dim, `L${l}_Q`);
        let k = this.safeCompute(x, k_w, params.kv_dim, `L${l}_K`);
        let v = this.safeCompute(x, v_w, params.kv_dim, `L${l}_V`);

        const q_norm_w = await loader.getLayerWeight(l, 'attn_q_norm');
        const k_norm_w = await loader.getLayerWeight(l, 'attn_k_norm');

        if (q_norm_w) {
            for (let h = 0; h < params.n_head; h++) {
                const off = h * params.head_dim;
                const head = q.subarray(off, off + params.head_dim);
                const w_slice = (q_norm_w.length >= params.q_dim) ? q_norm_w.subarray(off, off + params.head_dim) : q_norm_w;
                q.set(Stats.rmsNorm(head, w_slice, params.norm_eps, 0.0), off);
            }
        }
        if (k_norm_w) {
            for (let h = 0; h < params.n_head_kv; h++) {
                const off = h * params.head_dim;
                const head = k.subarray(off, off + params.head_dim);
                const w_slice = (k_norm_w.length >= params.kv_dim) ? k_norm_w.subarray(off, off + params.head_dim) : k_norm_w;
                k.set(Stats.rmsNorm(head, w_slice, params.norm_eps, 0.0), off);
            }
        }

        let isSliding = false;
        if (params.sliding_window > 0 && params.sliding_window_pattern > 0) {
            isSliding = ((l + 1) % params.sliding_window_pattern) !== 0;
        }
        const freq = isSliding ? params.rope_freq_local : params.rope_freq;
        const scale_rope = isSliding ? 1.0 : params.rope_scale;

        const q_r = Rope.rope(q, params.head_dim, pos, freq, scale_rope, params.rope_is_neox);
        const k_r = Rope.rope(k, params.head_dim, pos, freq, scale_rope, params.rope_is_neox);

        if (!this.engine.kv_cache[l]) this.engine.kv_cache[l] = { k: [], v: [] };
        this.engine.kv_cache[l].k[pos] = k_r;
        this.engine.kv_cache[l].v[pos] = (v._wasmPtr !== undefined) ? Wasm.copyOut(v) : v;

        const out_attn = new Float32Array(params.q_dim);
        const scale_factor = 1.0 / Math.sqrt(params.query_pre_attn_scalar || params.head_dim);
        const ratio = params.n_head / params.n_head_kv;

        let startPos = 0;
        if (isSliding && params.sliding_window > 0) {
            startPos = Math.max(0, pos - params.sliding_window + 1);
        }

        for (let h = 0; h < params.n_head; h++) {
            const h_off = h * params.head_dim;
            const q_h = q_r.subarray(h_off, h_off + params.head_dim);
            const kv_h = Math.floor(h / ratio);
            const kv_off = kv_h * params.head_dim;

            const validLen = pos - startPos + 1;
            const scores = new Float32Array(validLen);
            for (let i = 0; i < validLen; i++) {
                const p = startPos + i;
                const k_h = this.engine.kv_cache[l].k[p].subarray(kv_off, kv_off + params.head_dim);
                let dot = 0;
                for (let j = 0; j < params.head_dim; j++) dot += q_h[j] * k_h[j];
                scores[i] = dot * scale_factor;
            }

            let cap_scores = scores;
            if (params.attn_soft_cap > 0) {
                cap_scores = Act.softCap(scores, params.attn_soft_cap);
            }

            const probs = Stats.softmax(cap_scores);
            const out_h = out_attn.subarray(h_off, h_off + params.head_dim);
            for (let i = 0; i < validLen; i++) {
                const p = startPos + i;
                const v_h = this.engine.kv_cache[l].v[p].subarray(kv_off, kv_off + params.head_dim);
                const prob = probs[i];
                for (let j = 0; j < params.head_dim; j++) out_h[j] += prob * v_h[j];
            }
        }

        const o_w = await loader.getLayerWeight(l, 'attn_out');
        return this.safeCompute(out_attn, o_w, params.n_embd, `L${l}_O`);
    }

    async computeFFN(x, l, params, loader) {
        const w_g = await loader.getLayerWeight(l, 'ffn_gate');
        const w_u = await loader.getLayerWeight(l, 'ffn_up');
        const w_d = await loader.getLayerWeight(l, 'ffn_down');
        const n_ff = w_g.length / params.n_embd;
        
        let gate = this.safeCompute(x, w_g, n_ff, `L${l}_Gate`);
        let up = this.safeCompute(x, w_u, n_ff, `L${l}_Up`);

        if (Wasm.exports && gate._wasmPtr !== undefined && up._wasmPtr !== undefined) {
             if (params.act_fn === 'gelu') {
                 Wasm.exports.gelu_inplace(gate._wasmPtr, n_ff);
             } else {
                 Wasm.exports.silu_inplace(gate._wasmPtr, n_ff);
             }
             Wasm.exports.vec_mul_inplace(gate._wasmPtr, up._wasmPtr, n_ff);
             return this.safeCompute(gate, w_d, params.n_embd, `L${l}_Down`);
        }
        
        if (gate._wasmPtr !== undefined) gate = Wasm.copyOut(gate);
        if (up._wasmPtr !== undefined) up = Wasm.copyOut(up);
        
        const act = (params.act_fn === 'gelu') ? Act.gelu(gate) : Stats.silu(gate);
        for (let i = 0; i < n_ff; i++) act[i] *= up[i];
        
        return this.safeCompute(act, w_d, params.n_embd, `L${l}_Down`);
    }
}

module.exports = Layers;
