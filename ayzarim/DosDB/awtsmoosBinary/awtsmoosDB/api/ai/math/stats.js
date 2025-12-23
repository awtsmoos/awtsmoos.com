// B"H
const Wasm = require('./wasm_jit.js');

function rmsNorm(x, weight, epsilon = 1e-5) {
    const input = (x._wasmPtr !== undefined) ? Wasm.copyOut(x) : x;
    const size = input.length;
    
    let ss = 0;
    for(let i=0; i<size; i++) ss += input[i] * input[i];
    
    // B"H: Protection against overflow
    if (!Number.isFinite(ss)) {
        // If sum of squares is Infinity, result would be 0 or NaN.
        // We fallback to max value normalization to recover.
        let max = 0;
        for(let i=0; i<size; i++) max = Math.max(max, Math.abs(input[i]));
        if (max === 0) return new Float32Array(size); // All 0 or NaN?
        
        // Normalize by max first
        ss = 0;
        for(let i=0; i<size; i++) {
            input[i] /= max;
            ss += input[i] * input[i];
        }
        // Now ss is manageable
    }

    const rsqrt = 1.0 / Math.sqrt(ss / size + epsilon);
    
    const out = new Float32Array(size);
    const w = (weight && weight._wasmPtr !== undefined) ? Wasm.copyOut(weight) : weight;
    
    if (w) {
        for(let i=0; i<size; i++) out[i] = input[i] * rsqrt * w[i];
    } else {
        for(let i=0; i<size; i++) out[i] = input[i] * rsqrt;
    }
    
    return out;
}

function softmax(x) {
    const input = (x._wasmPtr !== undefined) ? Wasm.copyOut(x) : x;
    
    let max = -Infinity;
    for(let i=0; i<input.length; i++) if(input[i] > max) max = input[i];
    
    let sum = 0;
    const out = new Float32Array(input.length);
    for(let i=0; i<input.length; i++) {
        out[i] = Math.exp(input[i] - max);
        sum += out[i];
    }
    const invSum = 1.0 / sum;
    for(let i=0; i<input.length; i++) out[i] *= invSum;
    
    return out;
}

function silu(x) {
    const input = (x._wasmPtr !== undefined) ? Wasm.copyOut(x) : x;
    const out = new Float32Array(input.length);
    for(let i=0; i<input.length; i++) {
        const val = input[i];
        out[i] = val / (1.0 + Math.exp(-val));
    }
    return out;
}

module.exports = { rmsNorm, softmax, silu };