// B"H
const { F16_TABLE } = require('../math/quant.js');

function dotProduct(vecA, vecB) {
    let sum = 0;
    const len = vecA.length;
    let i = 0;
    const limit = len - 7;
    for (; i < limit; i += 8) {
        sum += vecA[i] * vecB[i] + vecA[i+1] * vecB[i+1] + vecA[i+2] * vecB[i+2] + vecA[i+3] * vecB[i+3]
             + vecA[i+4] * vecB[i+4] + vecA[i+5] * vecB[i+5] + vecA[i+6] * vecB[i+6] + vecA[i+7] * vecB[i+7];
    }
    for (; i < len; i++) sum += vecA[i] * vecB[i];
    return sum;
}

/**
 * FUSED Q4_0 Kernel
 * Computes Matrix * Vector directly from compressed bytes.
 * x: Float32Array (Input Vector, e.g. embedding size)
 * wRaw: Uint8Array (Compressed Matrix Block)
 * n_out: Number of rows (output size)
 */
function matVecMulQ4(x, wRaw, n_out) {
    const y = new Float32Array(n_out);
    const n_in = x.length; // Embedding dim (e.g. 640)
    
    // Q4_0: 32 values per 18 bytes
    const blockSize = 18; 
    const blocksPerTuple = n_in / 32; 
    
    let wPtr = 0;

    for (let i = 0; i < n_out; i++) {
        let sum = 0;

        // Iterate over blocks in the row
        for (let b = 0; b < blocksPerTuple; b++) {
            // 1. Read Scale (Delta) from F16 Table
            const val = wRaw[wPtr] | (wRaw[wPtr+1] << 8);
            const d = F16_TABLE[val];
            wPtr += 2;

            // 2. Base Index for X
            const xBase = b * 32;

            // 3. Loop over 16 bytes (32 weights)
            for (let j = 0; j < 16; j++) {
                const byte = wRaw[wPtr++];
                
                // Low Nibble -> j
                const v0 = (byte & 0x0F) - 8;
                sum += v0 * d * x[xBase + j];
                
                // High Nibble -> j + 16
                const v1 = (byte >> 4) - 8;
                sum += v1 * d * x[xBase + j + 16];
            }
        }
        y[i] = sum;
    }
    return y;
}

function matVecMul(x, w, n_out) {
    // Standard Float32 implementation
    const n_in = x.length;
    const y = new Float32Array(n_out);
    
    if (w.length !== n_out * n_in) return y;

    const limit = n_in - 7;

    for (let i = 0; i < n_out; i++) {
        let sum = 0;
        const offset = i * n_in;
        let j = 0;
        
        for (; j < limit; j += 8) {
            sum += w[offset + j] * x[j]
                 + w[offset + j + 1] * x[j + 1]
                 + w[offset + j + 2] * x[j + 2]
                 + w[offset + j + 3] * x[j + 3]
                 + w[offset + j + 4] * x[j + 4]
                 + w[offset + j + 5] * x[j + 5]
                 + w[offset + j + 6] * x[j + 6]
                 + w[offset + j + 7] * x[j + 7];
        }
        
        for (; j < n_in; j++) sum += w[offset + j] * x[j];
        y[i] = sum;
    }
    return y;
}

function addInPlace(a, b) {
    const len = a.length;
    let i = 0;
    const limit = len - 7;
    for (; i < limit; i += 8) {
        a[i] += b[i]; a[i+1] += b[i+1];
        a[i+2] += b[i+2]; a[i+3] += b[i+3];
        a[i+4] += b[i+4]; a[i+5] += b[i+5];
        a[i+6] += b[i+6]; a[i+7] += b[i+7];
    }
    for (; i < len; i++) a[i] += b[i];
}

function mul(a, b) {
    const len = a.length;
    const out = new Float32Array(len);
    let i = 0;
    const limit = len - 7;
    for (; i < limit; i += 8) {
        out[i] = a[i] * b[i]; out[i+1] = a[i+1] * b[i+1];
        out[i+2] = a[i+2] * b[i+2]; out[i+3] = a[i+3] * b[i+3];
        out[i+4] = a[i+4] * b[i+4]; out[i+5] = a[i+5] * b[i+5];
        out[i+6] = a[i+6] * b[i+6]; out[i+7] = a[i+7] * b[i+7];
    }
    for (; i < len; i++) out[i] = a[i] * b[i];
    return out;
}

// B"H: Export dedicated Q4 kernel
module.exports = { dotProduct, matVecMul, matVecMulQ4, addInPlace, mul };