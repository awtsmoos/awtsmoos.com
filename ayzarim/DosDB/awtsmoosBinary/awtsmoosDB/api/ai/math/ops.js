
// B"H
const Logger = require('../utils/logger.js');

const Ops = {
    // --- UTILS ---
    decodeF16: (h) => {
        const s = (h & 0x8000) >> 15;
        const e = (h & 0x7C00) >> 10;
        const f = h & 0x03FF;
        
        if(e == 0) return (s ? -1 : 1) * f * 5.9604644775390625e-8;
        if(e == 0x1F) return f ? NaN : ((s ? -1 : 1) * Infinity); 
        return (s ? -1 : 1) * Math.pow(2, e - 15) * (1 + f * 0.0009765625);
    },

    // --- ACTIVATIONS & NORMS ---
    rmsNorm: (x, weight, eps = 1e-6, unitOffset = 0.0) => {
        const size = x.length;
        if (!size) return x;

        let ss = 0;
        for (let i = 0; i < size; i++) ss += x[i] * x[i];
        ss /= size;
        const rsqrt = 1.0 / Math.sqrt(ss + eps);
        
        const out = new Float32Array(size);
        const wLen = weight ? weight.length : 0;
        const useWeight = wLen > 0;
        
        for (let i = 0; i < size; i++) {
            let w = 1.0;
            if (useWeight) {
                w = weight[i % wLen]; 
            } 
            // B"H - Apply offset to the weight itself
            w += unitOffset;
            
            out[i] = x[i] * rsqrt * w;
        }
        return out;
    },

    softmax: (x) => {
        let max = -Infinity;
        for (let i = 0; i < x.length; i++) if (x[i] > max) max = x[i];
        if (!isFinite(max)) max = 0;

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
    
    softCap: (x, cap) => {
        if (!cap || cap <= 0) return x;
        const out = new Float32Array(x.length);
        const invCap = 1.0 / cap;
        for (let i = 0; i < x.length; i++) {
            out[i] = cap * Math.tanh(x[i] * invCap);
        }
        return out;
    },

    // --- MATRIX OPS ---
    matVecMul: (x, w, n_out) => {
        const n_in = x.length;
        const out = new Float32Array(n_out);
        
        if (w.length < n_out * n_in) return out;

        for (let i = 0; i < n_out; i++) {
            const offset = i * n_in;
            let sum = 0;
            // Unroll loop 4x
            let j = 0;
            for (; j < n_in - 3; j += 4) {
                sum += w[offset + j] * x[j];
                sum += w[offset + j + 1] * x[j + 1];
                sum += w[offset + j + 2] * x[j + 2];
                sum += w[offset + j + 3] * x[j + 3];
            }
            for (; j < n_in; j++) sum += w[offset + j] * x[j];
            out[i] = sum;
        }
        return out;
    },

    // --- DEQUANTIZATION ---
    dequantize: (buffer, type, n_out) => {
        switch (type) {
            case 0: return Ops.dequantizeF32(buffer, n_out);
            case 1: return Ops.dequantizeF16(buffer, n_out);
            case 2: return Ops.dequantizeQ4_0(buffer, n_out);
            case 8: return Ops.dequantizeQ8_0(buffer, n_out);
            default:
                const res = new Float32Array(n_out);
                // Return small noise to prevent NaN propagation in unknown types
                for(let i=0; i<n_out; i++) res[i] = (Math.random() - 0.5) * 0.0001;
                return res;
        }
    },

    dequantizeF32: (buffer, n_out) => {
        if (buffer.byteOffset % 4 === 0) {
            return new Float32Array(buffer.buffer, buffer.byteOffset, n_out);
        } else {
            const copy = new Uint8Array(buffer.length);
            copy.set(buffer);
            return new Float32Array(copy.buffer, 0, n_out);
        }
    },

    dequantizeF16: (buffer, n_out) => {
        const res = new Float32Array(n_out);
        const bytes = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        for (let i = 0; i < n_out; i++) {
            const h = bytes[i*2] | (bytes[i*2 + 1] << 8);
            res[i] = Ops.decodeF16(h);
        }
        return res;
    },

    dequantizeQ4_0: (buffer, n_out) => {
        const blockSize = 18;
        const blockCount = Math.ceil(n_out / 32);
        
        const res = new Float32Array(n_out);
        const bytes = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        
        for (let b = 0; b < blockCount; b++) {
            const base = b * blockSize;
            if (base + 18 > bytes.length) break;

            const h = bytes[base] | (bytes[base + 1] << 8);
            const d = Ops.decodeF16(h);
            const safeD = (!isFinite(d)) ? 0 : d;

            for (let i = 0; i < 16; i++) {
                const idx = b * 32 + i;
                if (idx >= n_out) break;
                
                const byte = bytes[base + 2 + i];
                const x0 = (byte & 0x0F) - 8;
                const x1 = (byte >> 4) - 8;
                
                res[idx] = x0 * safeD;
                if (idx + 16 < n_out) res[idx + 16] = x1 * safeD;
            }
        }
        return res;
    },
    
    dequantizeQ8_0: (buffer, n_out) => {
        const blockSize = 34;
        const blockCount = Math.ceil(n_out / 32);
        const res = new Float32Array(n_out);
        const bytes = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        
        for (let b = 0; b < blockCount; b++) {
            const base = b * blockSize;
            if (base + 34 > bytes.length) break;

            const h = bytes[base] | (bytes[base + 1] << 8);
            const d = Ops.decodeF16(h);
            const safeD = (!isFinite(d)) ? 0 : d;
            
            for (let i = 0; i < 32; i++) {
                const idx = b * 32 + i;
                if (idx >= n_out) break;
                let val = bytes[base + 2 + i];
                if (val > 127) val -= 256; 
                res[idx] = val * safeD;
            }
        }
        return res;
    }
};

module.exports = Ops;
