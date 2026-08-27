
// B"H

/**
 * High-performance Pade Approximation of Tanh.
 */
function fastTanh(x) {
    if (x > 4.97) return 1.0;
    if (x < -4.97) return -1.0;
    const x2 = x * x;
    return x * (135135 + x2 * (17325 + x2 * (378 + x2))) / 
               (135135 + x2 * (62370 + x2 * (3150 + x2 * 28)));
}

function softCap(x, cap) {
    if (!cap || cap <= 0) return x;
    const out = new Float32Array(x.length);
    const invCap = 1.0 / cap;
    for (let i = 0; i < x.length; i++) {
        out[i] = cap * Math.tanh(x[i] * invCap);
    }
    return out;
}

function gelu(x) {
    const out = new Float32Array(x.length);
    const COEF = 0.044715;
    const SQRT_2_PI = 0.7978845608;

    for (let i = 0; i < x.length; i++) {
        const v = x[i];
        const v3 = v * v * v;
        // B"H: Use Math.tanh for maximum compatibility/accuracy
        out[i] = 0.5 * v * (1.0 + Math.tanh(SQRT_2_PI * (v + COEF * v3)));
    }
    return out;
}

module.exports = { softCap, gelu, fastTanh };