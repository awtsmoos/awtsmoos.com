
// B"H
const Ops = require('../math/ops.js');
const { applyRoPE } = require('../models/gemma/utils.js');
const Logger = require('../utils/logger.js');

class Layers {
    constructor(engine) {
        this.engine = engine;
    }

    forward(x, l, pos) {
        const p = this.engine.params;
        const map = this.engine.loader.layerTensorMap[l];
        
        // B"H - Gemma 3 uses unit offset for all norms
        const unitOffset = p.arch === 'gemma3' ? 1.0 : 0.0;
        
        const debug = (l === 0 && pos === 0);

        // 1. Pre-Attn Norm
        const w_norm = this.engine.loader.getTensor(map.attn_norm);
        // Correctly pass unitOffset to rmsNorm
        let x_norm = Ops.rmsNorm(x, w_norm, p.norm_eps, unitOffset);

        // 2. Attention
        const attn_out = this.computeAttention(x_norm, l, pos, p, map, debug, unitOffset);

        // 3. Post-Attn Norm (Gemma 3)
        let curr_attn = attn_out;
        if (map.attn_post_norm) {
            const w_post = this.engine.loader.getTensor(map.attn_post_norm);
            curr_attn = Ops.rmsNorm(curr_attn, w_post, p.norm_eps, unitOffset);
        }

        // Residual 1
        for(let i=0; i<x.length; i++) x[i] += curr_attn[i];

        // 4. Pre-FFN Norm
        const w_ffn_norm = this.engine.loader.getTensor(map.ffn_norm);
        let x_ffn_norm = Ops.rmsNorm(x, w_ffn_norm, p.norm_eps, unitOffset);

        // 5. FFN
        let ffn_out = this.computeFFN(x_ffn_norm, l, p, map);

        // 6. Post-FFN Norm (Gemma 3)
        if (map.ffn_post_norm) {
             const w_post_ffn = this.engine.loader.getTensor(map.ffn_post_norm);
             ffn_out = Ops.rmsNorm(ffn_out, w_post_ffn, p.norm_eps, unitOffset);
        }

        // Residual 2
        for(let i=0; i<x.length; i++) x[i] += ffn_out[i];
        
        return x;
    }

    computeAttention(x, l, pos, p, map, debug, unitOffset) {
        const w_q = this.engine.loader.getTensor(map.attn_q);
        const w_k = this.engine.loader.getTensor(map.attn_k);
        const w_v = this.engine.loader.getTensor(map.attn_v);
        
        if (!w_q || !w_k || !w_v) return new Float32Array(p.n_embd);

        let q = Ops.matVecMul(x, w_q, p.n_head * p.head_dim);
        let k = Ops.matVecMul(x, w_k, p.n_head_kv * p.head_dim);
        let v = Ops.matVecMul(x, w_v, p.n_head_kv * p.head_dim);

        // QK Norm (Gemma 3) - Uses RMS Norm with unit offset usually?
        // Note: llama.cpp implementation of qk_norm does NOT add unit offset (weight_bias), only layer norms do.
        // Checking gemma3.cpp or llama-model.cpp: 
        //   layer.attn_q_norm = create_tensor(..., {n_embd_head_k}, 0);
        //   In build_attn_mha: 
        //   q.set(normed, start); 
        //   The norm used is rms_norm. 
        //   However, only 'attn_norm', 'ffn_norm', 'attn_post_norm', 'ffn_post_norm' are marked for unit offset in the official implementation typically?
        //   Wait, `awtsmoos-gguf/worker_src/model_attn.js` passes `0.0` for unitOffset in QK Norm section!
        //   "const normed = self.rmsNorm(q_head, w_slice, params.norm_eps, 0.0);"
        //   So QK Norm DOES NOT use unitOffset. Correct.
        
        if (map.attn_q_norm) {
            const w_qn = this.engine.loader.getTensor(map.attn_q_norm);
            // Handling varying sizes of q_norm tensor (per head vs shared)
            const w_slice_len = w_qn.length >= p.q_dim ? p.head_dim : w_qn.length;
            
            for (let h = 0; h < p.n_head; h++) {
                 const start = h * p.head_dim;
                 const q_head = q.subarray(start, start + p.head_dim);
                 
                 let w = w_qn;
                 if (w_qn.length >= p.q_dim) {
                     w = w_qn.subarray(start, start + p.head_dim);
                 }
                 
                 const normed = Ops.rmsNorm(q_head, w, p.norm_eps, 0.0); // 0.0 offset for QK norm
                 q.set(normed, start);
            }
        }
        if (map.attn_k_norm) {
            const w_kn = this.engine.loader.getTensor(map.attn_k_norm);
            
            for (let h = 0; h < p.n_head_kv; h++) {
                 const start = h * p.head_dim;
                 const k_head = k.subarray(start, start + p.head_dim);
                 
                 let w = w_kn;
                 if (w_kn.length >= p.kv_dim) {
                     w = w_kn.subarray(start, start + p.head_dim);
                 }

                 const normed = Ops.rmsNorm(k_head, w, p.norm_eps, 0.0); // 0.0 offset for QK norm
                 k.set(normed, start);
            }
        }

        // RoPE
        let isSliding = false;
        if (p.sliding_window > 0 && p.sliding_window_pattern > 0) {
            isSliding = ((l + 1) % p.sliding_window_pattern) !== 0;
        }
        const freq = isSliding ? p.rope_freq_local : p.rope_freq_global;
        const scale = isSliding ? 1.0 : p.rope_scale;

        applyRoPE(q, k, pos, p.head_dim, freq, scale, p.rope_is_neox);

        // KV Cache
        if(!this.engine.kv_cache[l]) this.engine.kv_cache[l] = {k:[], v:[]};
        this.engine.kv_cache[l].k[pos] = k;
        this.engine.kv_cache[l].v[pos] = v;

        // Attention Scores
        let score_scale;
        if (p.query_pre_attn_scalar > 0) score_scale = 1.0 / Math.sqrt(p.query_pre_attn_scalar);
        else score_scale = 1.0 / Math.sqrt(p.head_dim);

        // Sliding Window Masking
        let startPos = 0;
        if (isSliding && p.sliding_window > 0) {
            startPos = Math.max(0, pos - p.sliding_window + 1);
        }

        const out_attn = new Float32Array(p.q_dim);
        const ratio = Math.floor(p.n_head / p.n_head_kv);

        for (let h = 0; h < p.n_head; h++) {
            const h_off = h * p.head_dim;
            const q_h = q.subarray(h_off, h_off + p.head_dim);
            
            const kv_h = Math.floor(h / ratio);
            const kv_off = kv_h * p.head_dim;
            
            const validLen = pos - startPos + 1;
            const scores = new Float32Array(validLen);
            
            for (let i = 0; i < validLen; i++) {
                const t = startPos + i;
                const k_t = this.engine.kv_cache[l].k[t].subarray(kv_off, kv_off + p.head_dim);
                
                let dot = 0;
                for(let j=0; j<p.head_dim; j++) dot += q_h[j] * k_t[j];
                scores[i] = dot * score_scale;
            }

            // Soft Cap
            let cap_scores = scores;
            if (p.attn_soft_cap > 0) {
                 cap_scores = Ops.softCap(scores, p.attn_soft_cap);
            }

            const probs = Ops.softmax(cap_scores);
            const out_h = out_attn.subarray(h_off, h_off + p.head_dim);

            for (let i = 0; i < validLen; i++) {
                const t = startPos + i;
                const val = probs[i];
                const v_t = this.engine.kv_cache[l].v[t].subarray(kv_off, kv_off + p.head_dim);
                for(let j=0; j<p.head_dim; j++) out_h[j] += val * v_t[j];
            }
        }

        const w_o = this.engine.loader.getTensor(map.attn_output);
        return Ops.matVecMul(out_attn, w_o, p.n_embd);
    }

    computeFFN(x, l, p, map) {
        const w_g = this.engine.loader.getTensor(map.ffn_gate);
        const w_u = this.engine.loader.getTensor(map.ffn_up);
        const w_d = this.engine.loader.getTensor(map.ffn_down);
        
        if (!w_g) return new Float32Array(p.n_embd);

        const n_ff = w_g.length / p.n_embd;
        
        const gate = Ops.matVecMul(x, w_g, n_ff);
        const up = Ops.matVecMul(x, w_u, n_ff);
        
        let act;
        if (p.act_fn === 'gelu') act = Ops.gelu(gate);
        else act = Ops.silu(gate);
        
        for(let i=0; i<n_ff; i++) act[i] *= up[i];
        
        return Ops.matVecMul(act, w_d, p.n_embd);
    }
}

module.exports = Layers;
