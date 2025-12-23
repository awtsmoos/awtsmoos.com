// B"H
const Wasm = require('./wasm_jit.js');

function rope(x, head_dim, pos, freq_base, freq_scale, is_neox = false) {
    const input = (x._wasmPtr !== undefined) ? Wasm.copyOut(x) : x;
    const len = input.length;
    if (len === 0) return new Float32Array(0);

    const out = new Float32Array(input); 
    const n_heads = (len / head_dim) | 0;
    const half_dim = head_dim / 2;
    const theta_scale = Math.pow(freq_base, -2.0 / head_dim);
    
    // Precompute cos/sin for this position if optimization needed, 
    // but here we calculate on the fly for simplicity/correctness first.

    for (let h = 0; h < n_heads; h++) {
        const offset = h * head_dim;
        
        for (let i = 0; i < half_dim; i++) {
            // Theta is same for both modes at index i
            const theta = pos * freq_scale * Math.pow(theta_scale, i);
            const cos_t = Math.cos(theta);
            const sin_t = Math.sin(theta);
            
            if (is_neox) {
                // Neox Style: Rotate [i] with [i + half_dim]
                // [ x0, x1, ..., xN, y0, y1, ..., yN ]
                const idx0 = offset + i;
                const idx1 = offset + i + half_dim;
                
                const v0 = out[idx0];
                const v1 = out[idx1];
                
                out[idx0] = v0 * cos_t - v1 * sin_t;
                out[idx1] = v0 * sin_t + v1 * cos_t;
            } else {
                // Llama/Gemma Style: Rotate adjacent pairs [2*i] and [2*i+1]
                // [ x0, y0, x1, y1, ..., xN, yN ]
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