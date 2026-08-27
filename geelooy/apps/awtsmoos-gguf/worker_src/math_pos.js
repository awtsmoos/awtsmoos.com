
// B"H
export const MathPosSource = () => {
    
    self.rope = (x, head_dim, pos, freq_base, freq_scale, is_neox) => {
        if (!x) return new Float32Array(0);
        
        // Protection against NaN/Inf freq_base
        if (!isFinite(freq_base) || freq_base <= 0) freq_base = 10000.0;

        const out = new Float32Array(x); 
        const n_heads = (x.length / head_dim) | 0;
        const half_dim = head_dim / 2;
        
        const theta_scale = Math.pow(freq_base, -2.0 / head_dim);

        for (let h = 0; h < n_heads; h++) {
            const offset = h * head_dim;
            
            for (let i = 0; i < half_dim; i++) {
                // Effective Theta = pos * scale * (base ^ (-2i/dim))
                // Note: The exponent depends on the index i.
                // In interleaved (standard) mode: pairs are (2i, 2i+1), theta depends on 2i.
                // In neox mode: pairs are (i, i+half), theta depends on i.
                // However, usually the theta formula is consistent: theta_i = base^(-2i/d).
                
                const theta = pos * freq_scale * Math.pow(theta_scale, i);
                const cos_theta = Math.cos(theta);
                const sin_theta = Math.sin(theta);
                
                let idx0, idx1;
                
                if (is_neox) {
                    // Neox Mode: Rotate x[i] with x[i + half_dim]
                    idx0 = offset + i;
                    idx1 = offset + i + half_dim;
                } else {
                    // Standard (Interleaved) Mode: Rotate x[2i] with x[2i+1]
                    idx0 = offset + 2 * i;
                    idx1 = offset + 2 * i + 1;
                }
                
                const v0 = out[idx0];
                const v1 = out[idx1];
                
                out[idx0] = v0 * cos_theta - v1 * sin_theta;
                out[idx1] = v0 * sin_theta + v1 * cos_theta;
            }
        }
        return out;
    };
};
