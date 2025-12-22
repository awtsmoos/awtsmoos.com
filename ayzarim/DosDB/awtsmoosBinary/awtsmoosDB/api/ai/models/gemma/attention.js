
// B"H
const Ops = require('../../math/ops.js');
const { asF32, applyRoPE } = require('./utils.js');

module.exports = function computeAttention(engine, x, l, pos, kv_cache) {
    const p = engine.params;
    
    const w_q = engine.getLayerWeight(l, 'attn_q');
    const w_k = engine.getLayerWeight(l, 'attn_k');
    const w_v = engine.getLayerWeight(l, 'attn_v');
    const w_o = engine.getLayerWeight(l, 'attn_output');

    let q = engine.linear(x, w_q);
    let k = engine.linear(x, w_k);
    const v = engine.linear(x, w_v);

    // QK Norm (Gemma 3)
    const w_qn = engine.getLayerWeight(l, 'attn_q_norm');
    const w_kn = engine.getLayerWeight(l, 'attn_k_norm');
    
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

    // RoPE
    let isSliding = false;
    if (p.sliding_window > 0 && p.sliding_window_pattern > 0) {
        isSliding = ((l + 1) % p.sliding_window_pattern) !== 0;
    }
    const freq_base = isSliding ? p.rope_freq_local : p.rope_freq_global;
    // B"H - Browser uses sliding window scale 1.0 for local freq
    const rope_scale = isSliding ? 1.0 : p.rope_scale;
    
    applyRoPE(q, k, pos, p.head_dim, freq_base, rope_scale, p.rope_is_neox);

    // KV Cache
    if (!kv_cache[l]) kv_cache[l] = { k: [], v: [] };
    kv_cache[l].k.push(k);
    kv_cache[l].v.push(v);

    // Score
    const scale = 1.0 / Math.sqrt(p.head_dim); 
    let attn_out = new Float32Array(p.n_embd);
    
    let startPos = 0;
    if (isSliding && p.sliding_window > 0) startPos = Math.max(0, pos - p.sliding_window + 1);

    const ratio = Math.floor(p.n_head / p.n_head_kv);

    for (let h = 0; h < p.n_head; h++) {
        const h_off = h * p.head_dim;
        const q_h = q.subarray(h_off, h_off + p.head_dim);
        
        const kv_h = Math.floor(h / ratio);
        const kv_off = kv_h * p.head_dim;
        
        let scores = [];
        for (let t = 0; t <= pos; t++) {
            if (t < startPos) { scores.push(-Infinity); continue; }
            const k_t = kv_cache[l].k[t];
            const k_h = k_t.subarray(kv_off, kv_off + p.head_dim);
            
            let dot = 0;
            for(let i=0; i<p.head_dim; i++) dot += q_h[i] * k_h[i];
            scores.push(dot * scale);
        }
        
        let scoreVec = new Float32Array(scores);
        if (p.attn_soft_cap > 0) scoreVec = Ops.softCap(scoreVec, p.attn_soft_cap);
        const probs = Ops.softmax(scoreVec);
        
        const o_h = attn_out.subarray(h_off, h_off + p.head_dim);
        for (let t = startPos; t <= pos; t++) {
            const val = probs[t];
            if (val > 1e-9) {
                const v_t = kv_cache[l].v[t];
                const v_h = v_t.subarray(kv_off, kv_off + p.head_dim);
                for(let i=0; i<p.head_dim; i++) o_h[i] += val * v_h[i];
            }
        }
    }

    if (w_o) attn_out = engine.linear(attn_out, w_o);
    return attn_out;
};
