// B"H
const Stats = require('../math/stats.js');
const Matrix = require('../math/matrix.js');
const Rope = require('../math/rope.js');
const Act = require('../math/act.js');
const Logger = require('../utils/logger.js');

class Layers {
    constructor(engine) {
        this.engine = engine;
    }

    getRoPEConfig(l, params) {
        let isSliding = false;
        if (params.sliding_window > 0 && params.sliding_window_pattern > 0) {
            isSliding = ((l + 1) % params.sliding_window_pattern) !== 0;
        } 
        const freq = isSliding ? params.rope_freq_local : params.rope_freq;
        const scale = isSliding ? 1.0 : params.rope_scale;
        return { freq, scale, isSliding };
    }

    forward(x, l, pos) {
        const p = this.engine.params;
        const loader = this.engine.loader;
        
        // B"H: Reverted to 0.0 (Workable State)
        const unitOffset = 0.0;
        
        let attn_norm_w = loader.getLayerWeight(l, 'attn_norm');
        let x_norm = Stats.rmsNorm(x, attn_norm_w, p.norm_eps, unitOffset);
        
        let attn_out = this.computeAttention(x_norm, l, p, loader, pos);
        
        let w_post_attn = loader.getLayerWeight(l, 'attn_post_norm');
        if (w_post_attn) {
             attn_out = Stats.rmsNorm(attn_out, w_post_attn, p.norm_eps, unitOffset);
        }
        
        Matrix.addInPlace(x, attn_out);
        
        let ffn_norm_w = loader.getLayerWeight(l, 'ffn_norm');
        let x_ffn_norm = Stats.rmsNorm(x, ffn_norm_w, p.norm_eps, unitOffset);
        
        let ffn_out = this.computeFFN(x_ffn_norm, l, p, loader);
        
        let w_post_ffn = loader.getLayerWeight(l, 'ffn_post_norm');
        if (w_post_ffn) {
            ffn_out = Stats.rmsNorm(ffn_out, w_post_ffn, p.norm_eps, unitOffset);
        }
        
        Matrix.addInPlace(x, ffn_out);
        
        return x;
    }

    computeAttention(x, l, params, loader, pos) {
        let q_w = loader.getLayerWeight(l, 'attn_q');
        let k_w = loader.getLayerWeight(l, 'attn_k');
        let v_w = loader.getLayerWeight(l, 'attn_v');
        
        if (!q_w || !k_w || !v_w) return new Float32Array(params.n_embd);

        let q = Matrix.matVecMul(x, q_w, params.q_dim);
        let k = Matrix.matVecMul(x, k_w, params.kv_dim);
        let v = Matrix.matVecMul(x, v_w, params.kv_dim);
        
        if (params.arch.includes('gemma')) {
             let w_qn = loader.getLayerWeight(l, 'attn_q_norm');
             let w_kn = loader.getLayerWeight(l, 'attn_k_norm');
             
             if (w_qn) {
                 for (let h = 0; h < params.n_head; h++) {
                     const start = h * params.head_dim;
                     const q_head = q.subarray(start, start + params.head_dim);
                     const w_slice = (w_qn.length >= params.q_dim) ? w_qn.subarray(start, start + params.head_dim) : w_qn;
                     const normed = Stats.rmsNorm(q_head, w_slice, params.norm_eps, 0.0);
                     q.set(normed, start);
                 }
             }

             if (w_kn) {
                 for (let h = 0; h < params.n_head_kv; h++) {
                     const start = h * params.head_dim;
                     const k_head = k.subarray(start, start + params.head_dim);
                     const w_slice = (w_kn.length >= params.kv_dim) ? w_kn.subarray(start, start + params.head_dim) : w_kn;
                     const normed = Stats.rmsNorm(k_head, w_slice, params.norm_eps, 0.0);
                     k.set(normed, start);
                 }
             }
        }
        
        const ropeConfig = this.getRoPEConfig(l, params);
        const q_r = Rope.rope(q, params.head_dim, pos, ropeConfig.freq, ropeConfig.scale, params.rope_is_neox);
        const k_r = Rope.rope(k, params.head_dim, pos, ropeConfig.freq, ropeConfig.scale, params.rope_is_neox);

        if (!this.engine.kv_cache[l]) this.engine.kv_cache[l] = { k: [], v: [] };
        this.engine.kv_cache[l].k[pos] = k_r;
        this.engine.kv_cache[l].v[pos] = v;

        let scale;
        if (params.query_pre_attn_scalar > 0) scale = 1.0 / Math.sqrt(params.query_pre_attn_scalar);
        else scale = 1.0 / Math.sqrt(params.head_dim);

        let startPos = 0;
        if (ropeConfig.isSliding && params.sliding_window > 0) {
            startPos = Math.max(0, pos - params.sliding_window + 1);
        }
        
        const out_attn = new Float32Array(params.q_dim);
        const ratio = Math.floor(params.n_head / params.n_head_kv);
        
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
                scores[i] = Matrix.dotProduct(q_h, k_h) * scale;
            }

            let cap_scores = scores;
            if (params.attn_soft_cap > 0) cap_scores = Act.softCap(scores, params.attn_soft_cap);
            
            const probs = Stats.softmax(cap_scores);
            const out_h = out_attn.subarray(h_off, h_off + params.head_dim);
            
            for (let i = 0; i < validLen; i++) {
                const p = startPos + i;
                const val = probs[i];
                const v_h = this.engine.kv_cache[l].v[p].subarray(kv_off, kv_off + params.head_dim);
                for (let j = 0; j < params.head_dim; j++) out_h[j] += val * v_h[j];
            }
        }
        
        let attn_proj_w = loader.getLayerWeight(l, 'attn_out');
        return Matrix.matVecMul(out_attn, attn_proj_w, params.n_embd);
    }

    computeFFN(x, l, params, loader) {
        let w_g = loader.getLayerWeight(l, 'ffn_gate');
        let w_u = loader.getLayerWeight(l, 'ffn_up');
        let w_d = loader.getLayerWeight(l, 'ffn_down');
        
        if (!w_g || !w_u || !w_d) return new Float32Array(params.n_embd);

        const n_ff = w_g.length / params.n_embd;

        const gate = Matrix.matVecMul(x, w_g, n_ff);
        const up = Matrix.matVecMul(x, w_u, n_ff);
        
        let act;
        if (params.act_fn === 'gelu') act = Act.gelu(gate);
        else act = Stats.silu(gate);

        const act_mul = Matrix.mul(act, up);
        return Matrix.matVecMul(act_mul, w_d, params.n_embd);
    }
}

module.exports = Layers;