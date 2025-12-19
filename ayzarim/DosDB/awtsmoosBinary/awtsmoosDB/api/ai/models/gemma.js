
// B"H
const Ops = require('../math/ops.js');

const asF32 = (u8) => {
    if (u8.byteOffset % 4 === 0) {
        return new Float32Array(u8.buffer, u8.byteOffset, u8.byteLength / 4);
    } else {
        return new Float32Array(u8.slice().buffer); 
    }
};

class GemmaModel {
    constructor(engine) {
        this.engine = engine;
        this.params = engine.params;
    }

    forward(x, pos, kv_cache) {
        this.engine.history.push(x);

        // 1. Embedding
        const w_emb = this.engine.getGlobalWeight('embed');
        if (!w_emb) throw new Error("Missing Embedding");

        const n_embd = this.params.n_embd;
        
        // Dequantize embedding row (Sync)
        const rowId = x;
        let hidden;
        
        // Assuming Q4_0 or F32
        if (w_emb.type === 2) { // Q4_0
            const blockSize = 18;
            const blockEls = 32;
            const rowBytes = (n_embd / blockEls) * blockSize;
            const offset = rowId * rowBytes;
            
            if (offset + rowBytes > w_emb.data.length) {
                hidden = new Float32Array(n_embd); 
            } else {
                const rowBuf = w_emb.data.subarray(offset, offset + rowBytes);
                hidden = Ops.dequantizeQ4_0(rowBuf, n_embd);
            }
        } else {
            // Fallback for F32
            const rowBytes = n_embd * 4;
            const offset = rowId * rowBytes;
            hidden = asF32(w_emb.data.subarray(offset, offset + rowBytes));
        }

        // Scale (Gemma specific)
        const scale = Math.sqrt(n_embd);
        for(let i=0; i<hidden.length; i++) hidden[i] *= scale;

        // 2. Layers
        for (let l = 0; l < this.params.n_layer; l++) {
            hidden = this.forwardLayer(hidden, l, pos, kv_cache);
        }

        // 3. Final Norm
        const w_norm = this.engine.getGlobalWeight('output_norm');
        if (w_norm) {
            const norm_v = asF32(w_norm.data);
            hidden = Ops.rmsNorm(hidden, norm_v, this.params.norm_eps);
        }

        return hidden;
    }

    forwardLayer(x, l, pos, kv_cache) {
        const p = this.params;
        
        // --- Pre-Norm ---
        const w_norm = this.engine.getLayerWeight(l, 'attn_norm');
        const norm_v = asF32(w_norm.data); 
        const x_norm = Ops.rmsNorm(x, norm_v, p.norm_eps);

        // --- Attention Projections ---
        const w_q = this.engine.getLayerWeight(l, 'attn_q');
        const w_k = this.engine.getLayerWeight(l, 'attn_k');
        const w_v = this.engine.getLayerWeight(l, 'attn_v');
        const w_o = this.engine.getLayerWeight(l, 'attn_output');

        let q = this.engine.linear(x_norm, w_q);
        let k = this.engine.linear(x_norm, w_k);
        const v = this.engine.linear(x_norm, w_v);

        // --- QK Norm (Gemma 3) ---
        const w_qn = this.engine.getLayerWeight(l, 'attn_q_norm');
        const w_kn = this.engine.getLayerWeight(l, 'attn_k_norm');
        
        if (w_qn) {
            const qn_full = asF32(w_qn.data);
            const isShared = qn_full.length === p.head_dim;
            for (let h = 0; h < p.n_head; h++) {
                const s = h * p.head_dim;
                const sub = q.subarray(s, s + p.head_dim);
                const w_slice = isShared ? qn_full : qn_full.subarray(s, s + p.head_dim);
                const normed = Ops.rmsNorm(sub, w_slice, p.norm_eps);
                q.set(normed, s);
            }
        }
        
        if (w_kn) {
            const kn_full = asF32(w_kn.data);
            const isShared = kn_full.length === p.head_dim;
            for (let h = 0; h < p.n_head_kv; h++) {
                const s = h * p.head_dim;
                const sub = k.subarray(s, s + p.head_dim);
                const w_slice = isShared ? kn_full : kn_full.subarray(s, s + p.head_dim);
                const normed = Ops.rmsNorm(sub, w_slice, p.norm_eps);
                k.set(normed, s);
            }
        }

        // --- RoPE (Hybrid Gemma 3) ---
        let isSliding = false;
        if (p.sliding_window > 0 && p.sliding_window_pattern > 0) {
            isSliding = ((l + 1) % p.sliding_window_pattern) !== 0;
        }
        
        const freq_base = isSliding ? p.rope_freq_local : p.rope_freq_global;
        // const freq_scale = isSliding ? 1.0 : p.rope_scale; // Backend logic usually pre-calcs scale? 
        // Logic from worker_src/model_attn.js: scale = isSliding ? 1.0 : params.rope_scale;
        
        this.applyRoPE(q, k, pos, p.head_dim, freq_base, p.rope_scale, p.rope_is_neox);

        // --- KV Cache ---
        if (!kv_cache[l]) kv_cache[l] = { k: [], v: [] };
        kv_cache[l].k.push(k);
        kv_cache[l].v.push(v);

        // --- Attention Score ---
        const head_dim = p.head_dim;
        const scale = 1.0 / Math.sqrt(head_dim); 
        let attn_out = new Float32Array(p.n_embd);
        
        let startPos = 0;
        if (isSliding && p.sliding_window > 0) startPos = Math.max(0, pos - p.sliding_window + 1);

        const ratio = Math.floor(p.n_head / p.n_head_kv);

        for (let h = 0; h < p.n_head; h++) {
            const h_off = h * head_dim;
            const q_h = q.subarray(h_off, h_off + head_dim);
            
            const kv_h = Math.floor(h / ratio);
            const kv_off = kv_h * head_dim;
            
            // Calculate Scores
            const scores = [];
            for (let t = 0; t <= pos; t++) {
                if (t < startPos) { scores.push(-Infinity); continue; }
                const k_t = kv_cache[l].k[t];
                const k_h = k_t.subarray(kv_off, kv_off + head_dim);
                
                let dot = 0;
                for(let i=0; i<head_dim; i++) dot += q_h[i] * k_h[i];
                scores.push(dot * scale);
            }
            
            // Softmax
            const probs = Ops.softmax(new Float32Array(scores));
            
            // Weighted Sum
            const o_h = attn_out.subarray(h_off, h_off + head_dim);
            for (let t = startPos; t <= pos; t++) {
                const val = probs[t];
                if (val > 1e-9) {
                    const v_t = kv_cache[l].v[t];
                    const v_h = v_t.subarray(kv_off, kv_off + head_dim);
                    for(let i=0; i<head_dim; i++) o_h[i] += val * v_h[i];
                }
            }
        }

        if (w_o) attn_out = this.engine.linear(attn_out, w_o);

        // --- Post-Attn Norm ---
        const w_post_attn = this.engine.getLayerWeight(l, 'attn_post_norm');
        if (w_post_attn) {
            const post_v = asF32(w_post_attn.data);
            attn_out = Ops.rmsNorm(attn_out, post_v, p.norm_eps);
        }

        for(let i=0; i<x.length; i++) x[i] += attn_out[i];

        // --- FFN ---
        const w_ffn_norm = this.engine.getLayerWeight(l, 'ffn_norm');
        const ffn_norm_v = asF32(w_ffn_norm.data);
        const x_ffn_norm = Ops.rmsNorm(x, ffn_norm_v, p.norm_eps);

        const w_gate = this.engine.getLayerWeight(l, 'ffn_gate');
        const w_up = this.engine.getLayerWeight(l, 'ffn_up');
        const w_down = this.engine.getLayerWeight(l, 'ffn_down');

        const gate = this.engine.linear(x_ffn_norm, w_gate);
        const up = this.engine.linear(x_ffn_norm, w_up);
        
        let act;
        if (p.act_fn === 'gelu') act = Ops.gelu(gate);
        else act = Ops.silu(gate);

        for(let i=0; i<gate.length; i++) act[i] *= up[i];

        let ffn_out = this.engine.linear(act, w_down);

        const w_post_ffn = this.engine.getLayerWeight(l, 'ffn_post_norm');
        if (w_post_ffn) {
            const post_ffn_v = asF32(w_post_ffn.data);
            ffn_out = Ops.rmsNorm(ffn_out, post_ffn_v, p.norm_eps);
        }

        for(let i=0; i<x.length; i++) x[i] += ffn_out[i];

        return x;
    }

    applyRoPE(q, k, pos, head_dim, freq_base, freq_scale, is_neox) {
        const half_dim = head_dim / 2;
        const theta_scale = Math.pow(freq_base, -2.0 / head_dim);
        
        // Loop over heads
        const n_q_heads = q.length / head_dim;
        const n_k_heads = k.length / head_dim;

        const rot = (vec, n_heads) => {
            for (let h = 0; h < n_heads; h++) {
                const off = h * head_dim;
                for (let i = 0; i < half_dim; i++) {
                    const theta = pos * Math.pow(theta_scale, i); // Standard GGUF RoPE
                    const cos = Math.cos(theta);
                    const sin = Math.sin(theta);
                    
                    let idx0, idx1;
                    if (is_neox) {
                        idx0 = off + i;
                        idx1 = off + i + half_dim;
                    } else {
                        idx0 = off + 2 * i;
                        idx1 = off + 2 * i + 1;
                    }
                    
                    const v0 = vec[idx0];
                    const v1 = vec[idx1];
                    
                    vec[idx0] = v0 * cos - v1 * sin;
                    vec[idx1] = v0 * sin + v1 * cos;
                }
            }
        };
        
        rot(q, n_q_heads);
        rot(k, n_k_heads);
    }
}

module.exports = GemmaModel;
