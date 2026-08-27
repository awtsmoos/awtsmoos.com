// B"H
export const QuantCommonSource = () => {
    
    const POW_2_NEG_14 = Math.pow(2, -14);

    self.decodeF16 = (h) => {
        const s = (h & 0x8000) >> 15;
        const e = (h & 0x7C00) >> 10;
        const f = h & 0x03FF;
        
        if(e == 0) return (s ? -1 : 1) * f * 5.9604644775390625e-8;
        if(e == 0x1F) return f ? NaN : ((s ? -1 : 1) * Infinity);
        return (s ? -1 : 1) * Math.pow(2, e - 15) * (1 + f * 0.0009765625);
    };

    /**
     * General Dequantizer Router
     */
    self.dequantize = (data, type, numElements) => {
        // Direct routing based on GGUF Type ID
        switch (type) {
            case 0: return self.deq_f32(data, numElements);
            case 1: return self.deq_f16(data, numElements);
            case 2: return self.deq_q4_0(data, numElements);
            case 6: return self.deq_q5_0(data, numElements); // Q5_0
            case 7: return self.deq_q5_1(data, numElements); // Q5_1
            case 8: return self.deq_q8_0(data, numElements);
            
            // K-Quants
            case 10: return self.deq_q2_k(data, numElements); // Q2_K
            case 11: return self.deq_q3_k(data, numElements); // Q3_K
            case 12: return self.deq_q4_k(data, numElements); // Q4_K
            case 13: return self.deq_q5_k(data, numElements); // Q5_K
            case 14: return self.deq_q6_k(data, numElements); // Q6_K
            
            // IQ-Quants
            case 16: return self.deq_iq2_xxs(data, numElements); // IQ2_XXS
            case 20: return self.deq_iq4_nl(data, numElements);  // IQ4_NL (Type 20)
            case 21: return self.deq_iq3_s(data, numElements);   // IQ3_S (Type 21)
            
            default:
                // B"H - SAFETY FALLBACK: Return small noise instead of zeros to prevent NaN
                // self.logDB(`[DEQUANT] Unsupported type: ${type}. Returning noise.`, 'warn');
                const fallback = new Float32Array(numElements);
                for(let i=0; i<numElements; i++) fallback[i] = (Math.random() - 0.5) * 0.0001;
                return fallback;
        }
    };

    self.deq_f32 = (data, n) => {
        if (data.byteOffset % 4 === 0) return new Float32Array(data.buffer, data.byteOffset, n);
        const res = new Float32Array(n);
        const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
        for (let i = 0; i < n; i++) res[i] = view.getFloat32(i * 4, true);
        return res;
    };

    self.deq_f16 = (data, n) => {
        const res = new Float32Array(n);
        for (let i = 0; i < n; i++) {
            const h = data[i*2] | (data[i*2 + 1] << 8);
            res[i] = self.decodeF16(h);
        }
        return res;
    };
};