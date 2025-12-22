
// B"H
const asF32 = (u8) => {
    if (!u8) return new Float32Array(0);
    if (u8.byteOffset % 4 === 0) {
        return new Float32Array(u8.buffer, u8.byteOffset, u8.byteLength / 4);
    } else {
        return new Float32Array(u8.slice().buffer); 
    }
};

const applyRoPE = (x, k, pos, head_dim, freq_base, freq_scale, is_neox) => {
    // Note: 'k' argument is ignored here if we process one vector 'x' at a time?
    // In layers.js we call applyRoPE(q, k, ...).
    // Wait, the logic in math_pos.js processes a single vector 'x'.
    // The previous implementation processed q and k together.
    // I will split it to process 'x' (which can be q or k) to match the worker logic structure better.
    
    const ropeSingle = (vec, n_dims, p, base, scale, neox) => {
        // Safe defaults
        if (!isFinite(base) || base <= 0) base = 10000.0;
        
        const n_heads = (vec.length / n_dims) | 0;
        const half_dim = n_dims / 2;
        const theta_scale = Math.pow(base, -2.0 / n_dims);

        for (let h = 0; h < n_heads; h++) {
            const offset = h * n_dims;
            for (let i = 0; i < half_dim; i++) {
                // Theta formula from math_pos.js:
                // theta = pos * freq_scale * Math.pow(theta_scale, i);
                // Note: 'i' in math_pos loop (which steps by 2) is actually 2*i if we iterate 0..half_dim?
                // math_pos.js iterates i = 0; i < n_dims; i += 2.
                // theta = pos * Math.pow(theta_scale, i / 2);
                
                // My loop iterates i = 0..half_dim. So 'i' corresponds to 'i/2' in math_pos.
                
                const theta = p * scale * Math.pow(theta_scale, i);
                const cos_theta = Math.cos(theta);
                const sin_theta = Math.sin(theta);
                
                let idx0, idx1;
                
                if (neox) {
                    idx0 = offset + i;
                    idx1 = offset + i + half_dim;
                } else {
                    idx0 = offset + 2 * i;
                    idx1 = offset + 2 * i + 1;
                }
                
                const v0 = vec[idx0];
                const v1 = vec[idx1];
                
                vec[idx0] = v0 * cos_theta - v1 * sin_theta;
                vec[idx1] = v0 * sin_theta + v1 * cos_theta;
            }
        }
    };
    
    // Apply to Q and K separately
    ropeSingle(x, head_dim, pos, freq_base, freq_scale, is_neox);
    ropeSingle(k, head_dim, pos, freq_base, freq_scale, is_neox);
};

module.exports = { asF32, applyRoPE };
