
// B"H
export const ModelBlockSource = () => {
    
    self.forwardLayer = function(x, layerIdx, params, pos) {
        const l = layerIdx;
        const prefix = `blk.${l}.`;
        const unitOffset = 0.0;
        
        // Debug L0
        const debug = (l === 0 && pos === 0);
        
        // 1. PRE-ATTN NORM
        let attn_norm_w = self.loadWeight(`${prefix}attn_norm.weight`);
        let x_norm = self.rmsNorm(x, attn_norm_w, params.norm_eps, unitOffset);
        
        // 2. ATTENTION BLOCK
        let attn_out = self.computeAttention(x_norm, l, params, prefix, pos);
        
        // 3. POST-ATTN NORM (Gemma 3)
        // Gemma 3 applies normalization to the attention output BEFORE adding to residual?
        // gemma3.cpp:
        // cur = build_attn(...)
        // cur = build_norm(cur, model.layers[il].attn_post_norm, ...)
        // sa_out = ggml_add(ctx0, cur, inpL);  <-- Residual added AFTER post-norm
        let w_post_attn = self.loadWeight(`${prefix}attn_post_norm.weight`);
        if (w_post_attn) {
             attn_out = self.rmsNorm(attn_out, w_post_attn, params.norm_eps, unitOffset);
        }
        
        // RESIDUAL 1
        for(let i=0; i<x.length; i++) x[i] += attn_out[i];
        
        // 4. PRE-FFN NORM
        let ffn_norm_w = self.loadWeight(`${prefix}ffn_norm.weight`);
        let x_ffn_norm = self.rmsNorm(x, ffn_norm_w, params.norm_eps, unitOffset);
        
        // 5. FFN BLOCK
        let ffn_out = self.computeFFN(x_ffn_norm, l, params, prefix);
        
        // 6. POST-FFN NORM (Gemma 3)
        // gemma3.cpp:
        // cur = build_ffn(...)
        // cur = build_norm(cur, model.layers[il].ffn_post_norm, ...)
        // cur = ggml_add(ctx0, cur, sa_out); <-- Residual added AFTER post-norm
        let w_post_ffn = self.loadWeight(`${prefix}ffn_post_norm.weight`);
        if (w_post_ffn) {
            ffn_out = self.rmsNorm(ffn_out, w_post_ffn, params.norm_eps, unitOffset);
        }
        
        // RESIDUAL 2
        for(let i=0; i<x.length; i++) x[i] += ffn_out[i];
        
        if (debug) self.logStats(`L0 Output`, x);

        return x;
    };
};
