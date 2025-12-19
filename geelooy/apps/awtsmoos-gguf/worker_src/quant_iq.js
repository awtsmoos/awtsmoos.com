// B"H
/**
 * Importance Matrix Quantization (IQ) Dequantizer
 * For Unsloth's IQ2_XXS format.
 */
export const QuantIQSource = () => {
    
    // As per llama.cpp: table_iq2_xxs = {-1.0f, 0.0f, 1.0f, -2.0f};
    const TABLE_IQ2_XXS = [-1.0, 0.0, 1.0, -2.0];

    self.deq_iq2_xxs = (data, numElements) => {
        const result = new Float32Array(numElements);
        const blockSize = 96;
        const QK = 256;
        const blockCount = numElements / QK;
        
        let idx = 0; // byte index

        for (let b = 0; b < blockCount; b++) {
            // 16 scales (F16), 32 bytes
            const scales = new Float32Array(16);
            for (let s = 0; s < 16; s++) {
                const h = data[idx] | (data[idx + 1] << 8);
                scales[s] = self.decodeF16(h);
                idx += 2;
            }

            // 64 bytes of 2-bit weights
            const qs = data.subarray(idx, idx + 64);
            idx += 64;

            const out_offset = b * QK;

            for (let i = 0; i < QK; i += 4) {
                const q_byte = qs[i / 4];
                const d = scales[i / 16];
                
                // Unpack 4 weights from the byte
                const w0 = (q_byte >> 0) & 0x3;
                const w1 = (q_byte >> 2) & 0x3;
                const w2 = (q_byte >> 4) & 0x3;
                const w3 = (q_byte >> 6) & 0x3;

                result[out_offset + i + 0] = d * TABLE_IQ2_XXS[w0];
                result[out_offset + i + 1] = d * TABLE_IQ2_XXS[w1];
                result[out_offset + i + 2] = d * TABLE_IQ2_XXS[w2];
                result[out_offset + i + 3] = d * TABLE_IQ2_XXS[w3];
            }
        }
        return result;
    };
};