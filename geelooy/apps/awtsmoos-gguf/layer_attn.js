// B"H
/**
 * Transformer Layer (Attention + FFN)
 */
import { rmsNorm, softmax, silu } from './math_stats.js';
import { matVecMul, addInPlace, mul, dotProduct } from './math_matrix.js';
import { rope } from './math_rope.js';
import { loadWeight } from './model_loader.js';

export async function forwardLayer(x, layerIdx, params, pos, kv_cache) {
    const l = layerIdx;
    const prefix = `blk.${l}.`;
    
    // Sync load from RAM
    const getW = (n1, n2) => loadWeight(`${prefix}${n1}`) || loadWeight(`layers.${l}.${n2}`);

    const res_attn = new Float32Array(x);
    
    // 1. Attention Norm
    let w_norm = getW('attn_norm.weight', 'attention_norm.weight');
    if (w_norm) x = rmsNorm(x, w_norm, params.norm_eps);

    // 2. QKV
    let w_q = getW('attn_q.weight', 'attention.wq.weight');
    let w_k = getW('attn_k.weight', 'attention.wk.weight');
    let w_v = getW('attn_v.weight', 'attention.wv.weight');
    
    if (w_q && w_k && w_v) {
        const q = matVecMul(x, w_q, params.n_head * params.head_dim);
        const k = matVecMul(x, w_k, params.n_head_kv * params.head_dim);
        const v = matVecMul(x, w_v, params.n_head_kv * params.head_dim);

        // 3. RoPE
        const q_r = rope(q, params.head_dim, pos, params.rope_freq);
        const k_r = rope(k, params.head_dim, pos, params.rope_freq);

        // 4. KV Cache
        if (!kv_cache[l]) kv_cache[l] = { k: [], v: [] };
        kv_cache[l].k[pos] = k_r; 
        kv_cache[l].v[pos] = v;

        // 5. Attention Scores
        const out_attn = computeAttention(q_r, kv_cache[l], params, pos);

        // 6. Output Proj
        let w_o = getW('attn_output.weight', 'attention.wo.weight');
        if (w_o) {
            const proj = matVecMul(out_attn, w_o, params.n_embd);
            addInPlace(res_attn, proj);
            x = res_attn;
        }
    }

    // --- FFN ---
    // Norm
    const res_ffn = new Float32Array(x);
    let ffn_norm = getW('ffn_norm.weight', 'ffn_norm.weight');
    if (ffn_norm) x = rmsNorm(x, ffn_norm, params.norm_eps);
    
    let w_g = getW('ffn_gate.weight', 'feed_forward.w1.weight');
    let w_d = getW('ffn_down.weight', 'feed_forward.w2.weight');
    let w_u = getW('ffn_up.weight',   'feed_forward.w3.weight');
    
    if (w_g && w_d && w_u) {
        const n_ff = w_g.length / params.n_embd;
        
        const g = matVecMul(x, w_g, n_ff);
        const u = matVecMul(x, w_u, n_ff);
        
        const act = mul(silu(g), u);
        const final = matVecMul(act, w_d, params.n_embd);
        
        addInPlace(res_ffn, final);
        x = res_ffn;
    }
    
    return x;
}

function computeAttention(q, cache, params, pos) {
    const out = new Float32Array(q.length);
    const scale = 1.0 / Math.sqrt(params.head_dim);
    const ratio = Math.floor(params.n_head / params.n_head_kv);

    for (let h = 0; h < params.n_head; h++) {
        const q_off = h * params.head_dim;
        const q_vec = q.subarray(q_off, q_off + params.head_dim);
        
        const kv_h = Math.floor(h / ratio);
        const kv_off = kv_h * params.head_dim;
        
        const logits = new Float32Array(pos + 1);
        for (let p = 0; p <= pos; p++) {
            const k_vec = cache.k[p].subarray(kv_off, kv_off + params.head_dim);
            logits[p] = dotProduct(q_vec, k_vec) * scale;
        }
        
        const probs = softmax(logits);
        
        const out_vec = out.subarray(q_off, q_off + params.head_dim);
        for (let p = 0; p <= pos; p++) {
            const prob = probs[p];
            const v_vec = cache.v[p].subarray(kv_off, kv_off + params.head_dim);
            for (let i = 0; i < params.head_dim; i++) out_vec[i] += prob * v_vec[i];
        }
    }
    return out;
}