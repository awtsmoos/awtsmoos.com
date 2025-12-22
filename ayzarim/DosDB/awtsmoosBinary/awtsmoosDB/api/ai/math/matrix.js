// B"H
const { F16_TABLE } = require('../math/quant.js');

function dotProduct(vecA, vecB) {
    let sum = 0.0;
    const len = vecA.length;
    // B"H: Simple 4x unroll is sufficient for vectors < 1000 length in Attention
    let i = 0;
    const limit = len - 3;
    for (; i < limit; i += 4) {
        sum += vecA[i] * vecB[i]
             + vecA[i+1] * vecB[i+1]
             + vecA[i+2] * vecB[i+2]
             + vecA[i+3] * vecB[i+3];
    }
    for (; i < len; i++) sum += vecA[i] * vecB[i];
    return sum;
}

function dotProductChunk(vecA, offsetA, vecB, offsetB, length) {
    let sum = 0.0;
    let i = 0;
    const limit = length - 3;
    for (; i < limit; i += 4) {
        sum += vecA[offsetA + i] * vecB[offsetB + i]
             + vecA[offsetA + i + 1] * vecB[offsetB + i + 1]
             + vecA[offsetA + i + 2] * vecB[offsetB + i + 2]
             + vecA[offsetA + i + 3] * vecB[offsetB + i + 3];
    }
    for (; i < length; i++) {
        sum += vecA[offsetA + i] * vecB[offsetB + i];
    }
    return sum;
}

/**
 * HYPER-OPTIMIZED KERNEL
 * Designed for 640-dim (Gemma) vectors.
 * 32-way Unrolling removes 97% of loop overhead.
 */
function matVecMul(x, w, n_out) {
    const n_in = x.length;
    const y = new Float32Array(n_out);
    
    // Fallback for non-aligned dimensions (safety first)
    if (n_in % 32 !== 0) {
        return matVecMulStandard(x, w, n_out, n_in, y);
    }

    let wPtr = 0;
    
    // Outer loop runs 262,144 times for Output, or 2560 times for FFN
    // Inner loop runs exactly 20 times for Gemma (640 / 32)
    for (let i = 0; i < n_out; i++) {
        let sum = 0.0;
        
        // Loop runs `n_in / 32` times.
        for (let j = 0; j < n_in; j += 32) {
            // 1. Prefetch X into local variables (CPU Registers)
            const x0 = x[j], x1 = x[j+1], x2 = x[j+2], x3 = x[j+3];
            const x4 = x[j+4], x5 = x[j+5], x6 = x[j+6], x7 = x[j+7];
            const x8 = x[j+8], x9 = x[j+9], x10=x[j+10], x11=x[j+11];
            const x12=x[j+12], x13=x[j+13], x14=x[j+14], x15=x[j+15];
            
            const x16=x[j+16], x17=x[j+17], x18=x[j+18], x19=x[j+19];
            const x20=x[j+20], x21=x[j+21], x22=x[j+22], x23=x[j+23];
            const x24=x[j+24], x25=x[j+25], x26=x[j+26], x27=x[j+27];
            const x28=x[j+28], x29=x[j+29], x30=x[j+30], x31=x[j+31];

            // 2. Fused Multiply-Accumulate
            // wPtr increments linearly, extremely cache friendly.
            sum += w[wPtr]   * x0  + w[wPtr+1] * x1  + w[wPtr+2] * x2  + w[wPtr+3] * x3
                 + w[wPtr+4] * x4  + w[wPtr+5] * x5  + w[wPtr+6] * x6  + w[wPtr+7] * x7
                 + w[wPtr+8] * x8  + w[wPtr+9] * x9  + w[wPtr+10]* x10 + w[wPtr+11]* x11
                 + w[wPtr+12]* x12 + w[wPtr+13]* x13 + w[wPtr+14]* x14 + w[wPtr+15]* x15
                 + w[wPtr+16]* x16 + w[wPtr+17]* x17 + w[wPtr+18]* x18 + w[wPtr+19]* x19
                 + w[wPtr+20]* x20 + w[wPtr+21]* x21 + w[wPtr+22]* x22 + w[wPtr+23]* x23
                 + w[wPtr+24]* x24 + w[wPtr+25]* x25 + w[wPtr+26]* x26 + w[wPtr+27]* x27
                 + w[wPtr+28]* x28 + w[wPtr+29]* x29 + w[wPtr+30]* x30 + w[wPtr+31]* x31;

            wPtr += 32;
        }
        y[i] = sum;
    }
    return y;
}

function matVecMulStandard(x, w, n_out, n_in, y) {
    let wPtr = 0;
    for (let i = 0; i < n_out; i++) {
        let sum = 0.0;
        for (let j = 0; j < n_in; j++) {
            sum += w[wPtr++] * x[j];
        }
        y[i] = sum;
    }
    return y;
}

function matVecMulQ4(x, wRaw, n_out) {
    const y = new Float32Array(n_out);
    const n_in = x.length; 
    const blocksPerTuple = n_in / 32; 
    let wPtr = 0;

    for (let i = 0; i < n_out; i++) {
        let sum = 0.0;
        for (let b = 0; b < blocksPerTuple; b++) {
            const val = wRaw[wPtr] | (wRaw[wPtr+1] << 8);
            const d = F16_TABLE[val];
            wPtr += 2;
            const xBase = b * 32;
            
            // Unroll Q4 inner loop 16x
            for (let j = 0; j < 16; j++) {
                const byte = wRaw[wPtr++];
                sum += ((byte & 0x0F) - 8) * d * x[xBase + j];
                sum += ((byte >> 4) - 8) * d * x[xBase + j + 16];
            }
        }
        y[i] = sum;
    }
    return y;
}

function addInPlace(a, b) {
    const len = a.length;
    // Simple loops for simple ops often vectorize better in V8 than manual unrolling
    for (let i = 0; i < len; i++) a[i] += b[i];
}

function mul(a, b) {
    const len = a.length;
    const out = new Float32Array(len);
    for (let i = 0; i < len; i++) out[i] = a[i] * b[i];
    return out;
}

module.exports = { dotProduct, dotProductChunk, matVecMul, matVecMulQ4, addInPlace, mul };