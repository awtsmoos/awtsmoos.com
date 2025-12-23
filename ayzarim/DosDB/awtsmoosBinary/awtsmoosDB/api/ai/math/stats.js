
// B"H
const Wasm = require('./wasm_jit.js');

function rmsNorm(x, weight, epsilon = 1e-5, offset = 0.0) {
    // B"H: WASM Fast Path
    // Only use WASM if the specific function we need is actually exported
    if (Wasm.exports && x._wasmPtr !== undefined) {
        const n = x._wasmLon;
        const outPtr = Wasm.alloc(n * 4);
        
        if (weight) {
            const wPtr = Wasm.uploadF32(weight);
            if (offset !== 0.0) {
                if (typeof Wasm.exports.rms_norm_with_offset === 'function') {
                    Wasm.exports.rms_norm_with_offset(outPtr, x._wasmPtr, wPtr, n, epsilon, offset);
                } else {
                    // Fallback to JS if JIT didn't export it (e.g. older compilation)
                    return rmsNormJS(x, weight, epsilon, offset);
                }
            } else {
                Wasm.exports.rms_norm(outPtr, x._wasmPtr, wPtr, n, epsilon);
            }
        } else {
            Wasm.exports.rms_norm_no_w(outPtr, x._wasmPtr, n, epsilon);
        }
        
        const view = Wasm.view(outPtr, n);
        if (Wasm.isValid(view)) {
            return view;
        }
    }

    return rmsNormJS(x, weight, epsilon, offset);
}

function rmsNormJS(x, weight, epsilon, offset = 0.0) {
    const input = (x._wasmPtr !== undefined) ? Wasm.copyOut(x) : x;
    const size = input.length;
    if (!size) return input;
    
    let ss = 0;
    for(let i=0; i<size; i++) ss += input[i] * input[i];
    
    const mean = ss / size;
    const rsqrt = 1.0 / Math.sqrt(mean + epsilon);
    
    const out = new Float32Array(size);
    const w = (weight && weight._wasmPtr !== undefined) ? Wasm.copyOut(weight) : weight;
    
    const wLen = w ? w.length : 0;
    const useWeight = wLen > 0;

    for(let i=0; i<size; i++) {
        let val = 1.0;
        if (useWeight) val = w[i % wLen];
        val += offset;
        out[i] = input[i] * rsqrt * val;
    }
    
    return out;
}

function softmax(x) {
    const input = (x._wasmPtr !== undefined) ? Wasm.copyOut(x) : x;
    const size = input.length;
    if (!size) return input;
    
    let max = -Infinity;
    for(let i=0; i<size; i++) if(input[i] > max) max = input[i];
    
    let sum = 0;
    const out = new Float32Array(size);
    for(let i=0; i<size; i++) {
        const v = Math.exp(input[i] - max);
        out[i] = v;
        sum += v;
    }
    
    if (sum === 0) sum = 1; // Prevent NaN
    const invSum = 1.0 / sum;
    
    for(let i=0; i<size; i++) out[i] *= invSum;
    
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
