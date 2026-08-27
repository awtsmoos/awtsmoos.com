// B"H
export const QuantLegacySource = () => {
    
    self.deq_q4_0 = (data, numElements) => {
        const result = new Float32Array(numElements);
        const QK = 32;
        const blockCount = numElements / QK;
        let idx = 0;
        
        for (let b = 0; b < blockCount; b++) {
            const h = data[idx] | (data[idx + 1] << 8); idx += 2;
            const d = self.decodeF16(h);
            for (let i = 0; i < 16; i++) {
                const byte = data[idx++];
                result[b * QK + i] = ((byte & 0x0F) - 8) * d;
                result[b * QK + i + 16] = ((byte >> 4) - 8) * d;
            }
        }
        return result;
    };

    self.deq_q8_0 = (data, numElements) => {
        const result = new Float32Array(numElements);
        const QK = 32;
        const blockCount = numElements / QK;
        let idx = 0;

        for (let b = 0; b < blockCount; b++) {
            const h = data[idx] | (data[idx + 1] << 8); idx += 2;
            const d = self.decodeF16(h);
            for (let i = 0; i < 32; i++) {
                let val = data[idx++];
                if (val > 127) val -= 256;
                result[b * QK + i] = val * d;
            }
        }
        return result;
    };

    self.deq_q5_0 = (data, numElements) => {
        const result = new Float32Array(numElements);
        const QK = 32;
        const blockCount = numElements / QK;
        let idx = 0;

        for (let b = 0; b < blockCount; b++) {
            const h = data[idx] | (data[idx + 1] << 8); idx += 2;
            const d = self.decodeF16(h);
            const qhBase = idx; idx += 4; // 4 bytes for high bits
            const qlBase = idx; idx += 16; // 16 bytes for low bits

            for (let i = 0; i < 16; i++) {
                const byte = data[qlBase + i];
                const hByte = data[qhBase + Math.floor(i/4)]; // 4 nibbles per byte? No, qh is packed differently.
                // Standard Q5_0 packing:
                // qh: 32 bits. bit i corresponds to x[i]. bit i+16 to x[i+16].
                // Actually usually: uint32_t qh; memcpy(&qh, &data[idx], 4);
                
                const x0_l = byte & 0x0F;
                const x1_l = byte >> 4;
                
                // Extract high bits from the 4 bytes at qhBase
                // bit i
                const bit0 = (data[qhBase + (i >> 3)] >> (i & 7)) & 1;
                // bit i+16
                const bit1 = (data[qhBase + ((i+16) >> 3)] >> ((i+16) & 7)) & 1;

                const x0 = x0_l | (bit0 << 4);
                const x1 = x1_l | (bit1 << 4);

                result[b * QK + i] = (x0 - 16) * d;
                result[b * QK + i + 16] = (x1 - 16) * d;
            }
        }
        return result;
    };

    self.deq_q5_1 = (data, numElements) => {
        // Similar to Q5_0 but with d and m (add)
        const result = new Float32Array(numElements);
        const QK = 32;
        const blockCount = numElements / QK;
        let idx = 0;

        for (let b = 0; b < blockCount; b++) {
            const h = data[idx] | (data[idx + 1] << 8); idx += 2;
            const d = self.decodeF16(h);
            const hm = data[idx] | (data[idx + 1] << 8); idx += 2;
            const m = self.decodeF16(hm);
            
            const qhBase = idx; idx += 4;
            const qlBase = idx; idx += 16;

            for (let i = 0; i < 16; i++) {
                const byte = data[qlBase + i];
                const x0_l = byte & 0x0F;
                const x1_l = byte >> 4;
                
                const bit0 = (data[qhBase + (i >> 3)] >> (i & 7)) & 1;
                const bit1 = (data[qhBase + ((i+16) >> 3)] >> ((i+16) & 7)) & 1;

                const x0 = x0_l | (bit0 << 4);
                const x1 = x1_l | (bit1 << 4);

                result[b * QK + i] = x0 * d + m;
                result[b * QK + i + 16] = x1 * d + m;
            }
        }
        return result;
    };
};