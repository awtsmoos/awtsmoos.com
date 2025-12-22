
// B"H
// Exact port from awtsmoos-gguf/math_stats.js

function rmsNorm(x, weight, epsilon = 1e-5, unitOffset = 0.0) {
    const size = x.length;
    let ss = 0;
    for(let i=0; i<size; i++) ss += x[i] * x[i];
    ss /= size;
    const rsqrt = 1.0 / Math.sqrt(ss + epsilon);
    
    const out = new Float32Array(size);
    const wLen = weight ? weight.length : 0;
    const useWeight = wLen > 0;

    for(let i=0; i<size; i++) {
        let w = 1.0;
        if (useWeight) {
             w = weight[i % wLen];
        }
        w += unitOffset;
        out[i] = x[i] * rsqrt * w;
    }
    return out;
}

function softmax(x) {
    let max = -Infinity;
    for(let i=0; i<x.length; i++) if(x[i] > max) max = x[i];
    
    let sum = 0;
    const out = new Float32Array(x.length);
    for(let i=0; i<x.length; i++) {
        out[i] = Math.exp(x[i] - max);
        sum += out[i];
    }
    for(let i=0; i<x.length; i++) out[i] /= sum;
    return out;
}

function silu(x) {
    const out = new Float32Array(x.length);
    for(let i=0; i<x.length; i++) out[i] = x[i] / (1.0 + Math.exp(-x[i]));
    return out;
}

module.exports = { rmsNorm, softmax, silu };
