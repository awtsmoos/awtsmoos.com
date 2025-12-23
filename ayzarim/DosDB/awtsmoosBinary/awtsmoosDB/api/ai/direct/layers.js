
// B"H
const Stats = require('../math/stats.js');
const Matrix = require('../math/matrix.js');
const Rope = require('../math/rope.js');
const Act = require('../math/act.js');
const Wasm = require('../math/wasm_jit.js');

/**
 * @module Layers
 * @description The mathematical vessels (Kelim) that filter the light of the model.
 * Precisely calibrated for Gemma 3 architecture symmetry.
 */
class Layers {
    constructor(engine) {
        this.engine = engine;
    }
    
    /**
     * B"H
     * Executes Wasm computation with a strict JS fallback.
     */
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

    /**
     * B"H
     * Forward pass through a single model layer.
     */
    forward(x, l, pos, trace) {
        const params = this.engine.params;
        const loader = this.engine.loader;

        // 1. PRE-ATTENTION NORMALIZATION
        let x_norm = trace(`L${l} Pre-Attn Norm`, () => {
            const w_norm = loader.getLayerWeight(l, 'attn_norm');
            return Stats.rmsNorm(x, w_norm, params.norm_eps, params.norm_offset);
        });

        // 2. ATTENTION BLOCK
        let attn_out = trace(`L${l} Attention`, () => {
            return this.computeAttention(x_norm, l, pos, params, loader);
        });

        // 3. POST-ATTENTION NORMALIZATION (Gemma 3)
        let sa_out = trace(`L${l} Post-Attn Norm`, () => {
            const w_post = loader.getLayerWeight(l, 'attn_post_norm');
            if (w_post) {
                attn_out = Stats.rmsNorm(attn_out, w_post, params.norm_eps, params.norm_offset);
            }
            Matrix.addInPlace(x, attn_out);
            return x;
        });

        // 4. PRE-FFN NORMALIZATION
        let x_ffn_norm = trace(`L${l} Pre-FFN Norm`, () => {
            const w_ffn_norm = loader.getLayerWeight(l, 'ffn_norm');
            return Stats.rmsNorm(sa_out, w_ffn_norm, params.norm_eps, params.norm_offset);
        });

        // 5. FFN BLOCK
        let ffn_out = trace(`L${l} FFN`, () => {
            return this.computeFFN(x_ffn_norm, l, params, loader);
        });

        // 6. POST-FFN NORMALIZATION (Gemma 3)
        return trace(`L${l} Post-FFN Norm`, () => {
            const w_ffn_post = loader.getLayerWeight(l, 'ffn_post_norm');
            if (w_ffn_post) {
                ffn_out = Stats.rmsNorm(ffn_out, w_ffn_post, params.norm_eps, params.norm_offset);
            }
            Matrix.addInPlace(x, ffn_out);
            return x;
        });
    }

    /**
     * B"H
     * Computes the Multi-Head Attention Mechanism.
     */
    computeAttention(x, l, pos, params, loader) {
        const q_w = loader.getLayerWeight(l, 'attn_q');
        const k_w = loader.getLayerWeight(l, 'attn_k');
        const v_w = loader.getLayerWeight(l, 'attn_v');

        let q = this.safeCompute(x, q_w, params.q_dim, `L${l}_Q`);
        let k = this.safeCompute(x, k_w, params.kv_dim, `L${l}_K`);
        let v = this.safeCompute(x, v_w, params.kv_dim, `L${l}_V`);

        // Per-Head QK Norm
        const q_norm_w = loader.getLayerWeight(l, 'attn_q_norm');
        const k_norm_w = loader.getLayerWeight(l, 'attn_k_norm');

        if (q_norm_w) {
            for (let h = 0; h < params.n_head; h++) {
                const off = h * params.head_dim;
                const head = q.subarray(off, off + params.head_dim);
                const w_slice = (q_norm_w.length >= params.q_dim) ? q_norm_w.subarray(off, off + params.head_dim) : q_norm_w;
                q.set(Stats.rmsNorm(head, w_slice, params.norm_eps, params.norm_offset), off);
            }
        }
        if (k_norm_w) {
            for (let h = 0; h < params.n_head_kv; h++) {
                const off = h * params.head_dim;
                const head = k.subarray(off, off + params.head_dim);
                const w_slice = (k_norm_w.length >= params.kv_dim) ? k_norm_w.subarray(off, off + params.head_dim) : k_norm_w;
                k.set(Stats.rmsNorm(head, w_slice, params.norm_eps, params.norm_offset), off);
            }
        }

        // RoPE with Hybrid Window logic
        let isSliding = false;
        if (params.sliding_window > 0 && params.sliding_window_pattern > 0) {
            isSliding = ((l + 1) % params.sliding_window_pattern) !== 0;
        }
        const freq = isSliding ? params.rope_freq_local : params.rope_freq;
        const scale = isSliding ? 1.0 : params.rope_scale;

        const q_r = Rope.rope(q, params.head_dim, pos, freq, scale, params.rope_is_neox);
        const k_r = Rope.rope(k, params.head_dim, pos, freq, scale, params.rope_is_neox);

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

            const scores = new Float32Array(pos - startPos + 1);
            for (let p = startPos; p <= pos; p++) {
                const k_h = this.engine.kv_cache[l].k[p].subarray(kv_off, kv_off + params.head_dim);
                let dot = 0;
                for (let i = 0; i < params.head_dim; i++) dot += q_h[i] * k_h[i];
                // B"H - Scale the dot product result for numerical stability
                scores[p - startPos] = dot * scale_factor;
            }

            const probs = Stats.softmax(scores);
            const out_h = out_attn.subarray(h_off, h_off + params.head_dim);
            for (let p = startPos; p <= pos; p++) {
                const v_h = this.engine.kv_cache[l].v[p].subarray(kv_off, kv_off + params.head_dim);
                const prob = probs[p - startPos];
                for (let i = 0; i < params.head_dim; i++) out_h[i] += prob * v_h[i];
            }
        }

        const o_w = loader.getLayerWeight(l, 'attn_out');
        return this.safeCompute(out_attn, o_w, params.n_embd, `L${l}_O`);
    }

    /**
     * B"H
     * Computes the Feed-Forward Network Block.
     */
    computeFFN(x, l, params, loader) {
        const w_g = loader.getLayerWeight(l, 'ffn_gate');
        const w_u = loader.getLayerWeight(l, 'ffn_up');
        const w_d = loader.getLayerWeight(l, 'ffn_down');

        const n_ff = w_g.length / params.n_embd;
        const gate = this.safeCompute(x, w_g, n_ff, `L${l}_Gate`);
        const up = this.safeCompute(x, w_u, n_ff, `L${l}_Up`);

        const act = (params.act_fn === 'gelu') ? Act.gelu(gate) : Stats.silu(gate);
        for (let i = 0; i < n_ff; i++) act[i] *= up[i];

        return this.safeCompute(act, w_d, params.n_embd, `L${l}_Down`);
    }
}

module.exports = Layers;
