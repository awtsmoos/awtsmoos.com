
// B"H
const Ops = require('../../math/ops.js');
const { asF32 } = require('./utils.js');

module.exports = function computeFFN(engine, x, l) {
    const p = engine.params;
    
    const w_ffn_norm = engine.getLayerWeight(l, 'ffn_norm');
    const ffn_norm_v = asF32(w_ffn_norm.data);
    const x_ffn_norm = Ops.rmsNorm(x, ffn_norm_v, p.norm_eps);

    const w_gate = engine.getLayerWeight(l, 'ffn_gate');
    const w_up = engine.getLayerWeight(l, 'ffn_up');
    const w_down = engine.getLayerWeight(l, 'ffn_down');

    const gate = engine.linear(x_ffn_norm, w_gate);
    const up = engine.linear(x_ffn_norm, w_up);
    
    let act;
    if (p.act_fn === 'gelu') act = Ops.gelu(gate);
    else act = Ops.silu(gate);

    for(let i=0; i<gate.length; i++) act[i] *= up[i];

    let ffn_out = engine.linear(act, w_down);

    const w_post_ffn = engine.getLayerWeight(l, 'ffn_post_norm');
    if (w_post_ffn) {
        const post_ffn_v = asF32(w_post_ffn.data);
        ffn_out = Ops.rmsNorm(ffn_out, post_ffn_v, p.norm_eps);
    }
    
    return ffn_out;
};
