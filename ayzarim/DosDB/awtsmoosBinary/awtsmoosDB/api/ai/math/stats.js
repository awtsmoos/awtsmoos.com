
// B"H
const Wasm = require('./wasm_jit.js');

/**
 * @module Stats
 * @description Statistical vessels for signal normalization and distribution.
 */
function rmsNorm(x, weight, epsilon = 1e-5, offset = 0.0) {
    if (Wasm.exports) {
        const n = (x._wasmPtr !== undefined) ? x._wasmLon : x.length;
        const outPtr = Wasm.allocScratch(n * 4);
        let xPtr = (x._wasmPtr !== undefined) ? x._wasmPtr : -1;
        if (xPtr === -1) { xPtr = Wasm.allocScratch(n * 4); Wasm.copyIn(xPtr, x); }
        
        if (weight) {
            const wPtr = Wasm.uploadF32(weight);
            Wasm.exports.rms_norm(outPtr, xPtr, wPtr, n, epsilon);
            // offset handled in JS if needed, but Gemma 3 usually uses 0.0
        } else {
            Wasm.exports.rms_norm_no_w(outPtr, xPtr, n, epsilon);
        }
        const view = Wasm.view(outPtr, n);
        if (Wasm.isValid(view)) return view;
    }
    return rmsNormJS(x, weight, epsilon, offset);
}

function rmsNormJS(x, weight, epsilon, offset = 0.0) {
    const input = (x._wasmPtr !== undefined) ? Wasm.copyOut(x) : x;
    const size = input.length;
    if (!size) return input;
    let ss = 0;
    for(let i=0; i<size; i++) ss += input[i] * input[i];
    const rms = Math.sqrt((ss / size) + epsilon);
    const invRms = 1.0 / (rms || 1e-9);
    const out = new Float32Array(size);
    const w = (weight && weight._wasmPtr !== undefined) ? Wasm.copyOut(weight) : weight;
    for(let i=0; i<size; i++) {
        let val = (w && w.length > 0) ? w[i % w.length] : 1.0;
        out[i] = input[i] * invRms * (val + offset);
    }
    return out;
}

function softmax(x) {
    if (Wasm.exports && x._wasmPtr !== undefined) {
        Wasm.exports.softmax_inplace(x._wasmPtr, x._wasmLon);
        return x;
    }
    const input = (x._wasmPtr !== undefined) ? Wasm.copyOut(x) : x;
    const size = input.length;
    let max = -Infinity;
    for(let i=0; i<size; i++) if(input[i] > max) max = input[i];
    if (!Number.isFinite(max)) max = 0;
    let sum = 0;
    const out = new Float32Array(size);
    for(let i=0; i<size; i++) {
        const v = Math.exp(input[i] - max);
        out[i] = v; sum += v;
    }
    const invSum = 1.0 / (sum || 1e-9);
    for(let i=0; i<size; i++) out[i] *= invSum;
    return out;
}

function silu(x) {
    const input = (x._wasmPtr !== undefined) ? Wasm.copyOut(x) : x;
    const out = new Float32Array(input.length);
    for(let i=0; i<input.length; i++) {
        const v = input[i];
        out[i] = v / (1.0 + Math.exp(-v));
    }
    return out;
}

module.exports = { rmsNorm, softmax, silu };
