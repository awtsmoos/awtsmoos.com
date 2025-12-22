
// B"H
const Ops = require('../../math/ops.js');
const { asF32 } = require('./utils.js');
const computeAttention = require('./attention.js');
const computeFFN = require('./ffn.js');

module.exports = function forwardLayer(engine, x, l, pos, kv_cache) {
    const p = engine.params;
    
    // --- Pre-Norm ---
    const w_norm = engine.getLayerWeight(l, 'attn_norm');
    const norm_v = asF32(w_norm.data); 
    const x_norm = Ops.rmsNorm(x, norm_v, p.norm_eps);

    // --- Attention ---
    let attn_out = computeAttention(engine, x_norm, l, pos, kv_cache);

    // --- Post-Attn Norm ---
    const w_post_attn = engine.getLayerWeight(l, 'attn_post_norm');
    if (w_post_attn) {
        const post_v = asF32(w_post_attn.data);
        attn_out = Ops.rmsNorm(attn_out, post_v, p.norm_eps);
    }

    for(let i=0; i<x.length; i++) x[i] += attn_out[i];

    // --- FFN ---
    const ffn_out = computeFFN(engine, x, l);

    for(let i=0; i<x.length; i++) x[i] += ffn_out[i];

    return x;
};
