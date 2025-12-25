
// B"H
const Wasm = require('./wasm_jit.js');

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
    
    if (Wasm.exports && x._wasmPtr !== undefined) {
        Wasm.exports.softcap_inplace(x._wasmPtr, x._wasmLon, cap);
        return x;
    }

    const input = (x._wasmPtr !== undefined) ? Wasm.copyOut(x) : x;
    const out = new Float32Array(input.length);
    const invCap = 1.0 / cap;
    for (let i = 0; i < input.length; i++) {
        out[i] = cap * Math.tanh(input[i] * invCap);
    }
    return out;
}

function gelu(x) {
    const input = (x._wasmPtr !== undefined) ? Wasm.copyOut(x) : x;
    const out = new Float32Array(input.length);
    const COEF = 0.044715;
    const SQRT_2_PI = 0.7978845608;

    for (let i = 0; i < input.length; i++) {
        const v = input[i];
        const v3 = v * v * v;
        out[i] = 0.5 * v * (1.0 + Math.tanh(SQRT_2_PI * (v + COEF * v3)));
    }
    return out;
}

module.exports = { softCap, gelu, fastTanh };
