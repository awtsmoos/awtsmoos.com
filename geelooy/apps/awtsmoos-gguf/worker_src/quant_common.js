// B"H
export const QuantCommonSource = () => {
    
    // B"H - Precomputed powers of 2 for F16 decoding to avoid Math.pow overhead
    const POW_2_NEG_14 = Math.pow(2, -14);
    const POW_2_NEG_24 = Math.pow(2, -24); // For subnormal scaling check

    /**
     * Decode F16
     * Expanding the compressed spark into a flame.
     * IEEE 754 Half-precision binary floating-point format:
     * 1 bit sign | 5 bits exponent | 10 bits significand
     */
    self.decodeF16 = (h) => {
        const s = (h & 0x8000) >> 15;
        const e = (h & 0x7C00) >> 10;
        const f = h & 0x03FF;
        
        if(e == 0) {
            // Subnormal: (s?-1:1) * 2^-14 * (f / 1024)
            // = (s?-1:1) * 6.103515625e-05 * (f * 0.0009765625)
            // = (s?-1:1) * f * 5.9604644775390625e-8
            return (s ? -1 : 1) * f * 5.9604644775390625e-8;
        }
        if(e == 0x1F) {
            // Inf / NaN
            return f ? NaN : ((s ? -1 : 1) * Infinity);
        }
        // Normal: (s?-1:1) * 2^(e-15) * (1 + f/1024)
        // Optimization: Use a lookup table for 2^(e-15) if possible, but Math.pow(2, e-15) is okay-ish.
        // Let's optimize: 2^(e-15) = 2^e * 2^-15.
        // Javascript floats are doubles.
        
        return (s ? -1 : 1) * Math.pow(2, e - 15) * (1 + f * 0.0009765625);
    };

    /**
     * General Dequantizer Router
     */
    self.dequantize = (data, type, numElements) => {
        // data is now Uint8Array
        // Dispatch to specific handlers based on type
        if (type === 0) return self.deq_f32(data, numElements);
        if (type === 1) return self.deq_f16(data, numElements);
        if (type === 2) return self.deq_q4_0(data, numElements);
        if (type === 8) return self.deq_q8_0(data, numElements);
        if (type === 12) return self.deq_q4_k(data, numElements); // Q4_K
        if (type === 13) return self.deq_q5_k(data, numElements); // Q5_K
        if (type === 14) return self.deq_q6_k(data, numElements); // Q6_K
        if (type === 19) return self.deq_iq2_xxs(data, numElements); // IQ2_XXS
        
        // Fallback
        self.logDB(`[DEQUANT] Unsupported type: ${type}. Returning zeros.`, 'error');
        return new Float32Array(numElements);
    };

    self.deq_f32 = (data, n) => {
        // Create a view directly on the buffer
        // Align check
        if (data.byteOffset % 4 === 0) {
            return new Float32Array(data.buffer, data.byteOffset, n);
        }
        // Fallback for unaligned copy
        const res = new Float32Array(n);
        const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
        for (let i = 0; i < n; i++) res[i] = view.getFloat32(i * 4, true);
        return res;
    };

    self.deq_f16 = (data, n) => {
        const res = new Float32Array(n);
        // Manual unroll for F16
        for (let i = 0; i < n; i++) {
            const offset = i * 2;
            const h = data[offset] | (data[offset + 1] << 8);
            res[i] = self.decodeF16(h);
        }
        return res;
    };
};