
// B"H
const Ops = {
    // Helper: Decode F16 (Brain Float 16 or IEEE 754 Half) - IEEE 754 logic from frontend
    decodeF16: (h) => {
        const s = (h & 0x8000) >> 15;
        const e = (h & 0x7C00) >> 10;
        const f = h & 0x03FF;
        if(e == 0) return (s ? -1 : 1) * f * 5.9604644775390625e-8; // (f / 1024) * 2^-14
        if(e == 0x1F) return f ? NaN : ((s ? -1 : 1) * Infinity);
        return (s ? -1 : 1) * Math.pow(2, e - 15) * (1 + f * 0.0009765625); // (1 + f/1024)
    },

    rmsNorm: (x, weight, eps = 1e-6) => {
        let ss = 0;
        for (let i = 0; i < x.length; i++) ss += x[i] * x[i];
        ss /= x.length;
        const rsqrt = 1.0 / Math.sqrt(ss + eps);
        
        const out = new Float32Array(x.length);
        for (let i = 0; i < x.length; i++) out[i] = x[i] * rsqrt * weight[i];
        return out;
    },

    softmax: (x) => {
        let max = -Infinity;
        for (let i = 0; i < x.length; i++) if (x[i] > max) max = x[i];
        
        let sum = 0;
        const out = new Float32Array(x.length);
        for (let i = 0; i < x.length; i++) {
            const v = Math.exp(x[i] - max);
            out[i] = v;
            sum += v;
        }
        
        const invSum = 1.0 / (sum || 1e-9);
        for (let i = 0; i < x.length; i++) out[i] *= invSum;
        return out;
    },

    silu: (x) => {
        const out = new Float32Array(x.length);
        for (let i = 0; i < x.length; i++) out[i] = x[i] / (1.0 + Math.exp(-x[i]));
        return out;
    },
    
    gelu: (x) => {
        const out = new Float32Array(x.length);
        const COEF = 0.044715;
        const SQRT_2_PI = 0.7978845608;
        for (let i = 0; i < x.length; i++) {
            const v = x[i];
            const v3 = v * v * v;
            out[i] = 0.5 * v * (1.0 + Math.tanh(SQRT_2_PI * (v + COEF * v3)));
        }
        return out;
    },

    // Standard F32 MatMul
    matVecMul: (x, w, n_out) => {
        const n_in = x.length;
        const out = new Float32Array(n_out);
        for (let i = 0; i < n_out; i++) {
            let sum = 0;
            const off = i * n_in;
            let j = 0;
            for (; j < n_in - 3; j += 4) {
                sum += x[j] * w[off + j];
                sum += x[j+1] * w[off + j + 1];
                sum += x[j+2] * w[off + j + 2];
                sum += x[j+3] * w[off + j + 3];
            }
            for (; j < n_in; j++) sum += x[j] * w[off + j];
            out[i] = sum;
        }
        return out;
    },
    
    dequantizeQ4_0: (buffer, n_out) => {
        const blockSize = 18;
        const blockCount = buffer.byteLength / blockSize;
        const res = new Float32Array(blockCount * 32);
        
        const bytes = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        
        for (let b = 0; b < blockCount; b++) {
            const base = b * blockSize;
            const h = bytes[base] | (bytes[base + 1] << 8);
            const d = Ops.decodeF16(h);

            for (let i = 0; i < 16; i++) {
                const byte = bytes[base + 2 + i];
                const x0 = (byte & 0x0F) - 8;
                const x1 = (byte >> 4) - 8;
                res[b * 32 + i] = x0 * d;
                res[b * 32 + i + 16] = x1 * d;
            }
        }
        return res;
    },
    
    matVecMulQ4_0: (x, buffer, n_out) => {
        const blockSize = 18; 
        const n_in = x.length; 
        const blockCountX = n_in / 32;
        
        const out = new Float32Array(n_out);
        const bytes = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        
        for (let i = 0; i < n_out; i++) {
            let sum = 0;
            const rowBase = i * blockCountX * blockSize;
            
            for (let b = 0; b < blockCountX; b++) {
                const base = rowBase + (b * blockSize);
                
                const h = bytes[base] | (bytes[base + 1] << 8);
                const d = Ops.decodeF16(h);
                
                const xBase = b * 32;
                
                for (let k = 0; k < 16; k++) {
                    const byte = bytes[base + 2 + k];
                    const w0 = (byte & 0x0F) - 8;
                    const w1 = (byte >> 4) - 8;
                    
                    sum += x[xBase + k] * w0 * d;
                    sum += x[xBase + k + 16] * w1 * d;
                }
            }
            out[i] = sum;
        }
        return out;
    }
};

module.exports = Ops;
