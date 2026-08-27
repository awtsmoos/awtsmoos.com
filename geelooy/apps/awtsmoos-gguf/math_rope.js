// B"H
export function rope(x, n_dims, pos, freq_base = 10000.0) {
    const out = new Float32Array(x.length);
    const n_heads = x.length / n_dims;
    const theta_scale = Math.pow(freq_base, -2.0 / n_dims);
    
    for (let h = 0; h < n_heads; h++) {
        const offset = h * n_dims;
        for (let i = 0; i < n_dims; i += 2) {
            const theta = pos * Math.pow(theta_scale, i / 2);
            const cos_theta = Math.cos(theta);
            const sin_theta = Math.sin(theta);
            
            const v0 = x[offset + i];
            const v1 = x[offset + i + 1];
            
            out[offset + i] = v0 * cos_theta - v1 * sin_theta;
            out[offset + i + 1] = v0 * sin_theta + v1 * cos_theta;
        }
    }
    return out;
}