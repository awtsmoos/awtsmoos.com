
// B"H
/**
 * @module RoPE
 * @description Precise manifestation of Rotary Positional Embeddings.
 */
function rope(x, head_dim, pos, freq_base, freq_scale, is_neox = true) {
    const input = (x._wasmPtr !== undefined) ? require('./wasm/jit.js').copyOut(x) : x;
    const len = input.length;
    if (len === 0) return new Float32Array(0);

    const out = new Float32Array(input); 
    const n_heads = (len / head_dim) | 0;
    const half_dim = head_dim / 2;
    
    const theta_scale = Math.pow(freq_base, -2.0 / head_dim);

    for (let h = 0; h < n_heads; h++) {
        const offset = h * head_dim;
        
        for (let i = 0; i < half_dim; i++) {
            const theta = pos * freq_scale * Math.pow(theta_scale, i);
            const cos_t = Math.cos(theta);
            const sin_t = Math.sin(theta);
            
            if (is_neox) {
                const idx0 = offset + i;
                const idx1 = offset + i + half_dim;
                const v0 = out[idx0];
                const v1 = out[idx1];
                out[idx0] = v0 * cos_t - v1 * sin_t;
                out[idx1] = v0 * sin_t + v1 * cos_t;
            } else {
                const idx0 = offset + (2 * i);
                const idx1 = offset + (2 * i) + 1;
                const v0 = out[idx0];
                const v1 = out[idx1];
                out[idx0] = v0 * cos_t - v1 * sin_t;
                out[idx1] = v0 * sin_t + v1 * cos_t;
            }
        }
    }
    
    return out;
}

module.exports = { rope };
