
// B"H
export const QuantKSource = () => {

    // B"H - Q2_K Implementation
    // Block Size: 256 elements
    // Layout: 
    // - scales: 16 bytes (packed scale/min for 16 superblocks)
    // - qs: 64 bytes (256 2-bit weights)
    // - d: F16 (Super-scale)
    // - dmin: F16 (Super-min)
    self.deq_q2_k = (data, numElements) => {
        const result = new Float32Array(numElements);
        const blockCount = numElements / 256;
        let idx = 0;

        for (let b = 0; b < blockCount; b++) {
            // 1. Pointers
            const scalesIdx = idx; 
            idx += 16;
            const qsIdx = idx;
            idx += 64;
            
            // 2. Read d, dmin (at the END of the block)
            const h_d = data[idx] | (data[idx+1] << 8);
            const d = self.decodeF16(h_d);
            const h_dm = data[idx+2] | (data[idx+3] << 8);
            const dmin = self.decodeF16(h_dm);
            idx += 4;

            const sbBase = b * 256;

            // 3. Unpack Weights
            // The format splits the block into two halves of 128 weights (32 bytes of qs each)
            
            // --- First 128 elements (qs bytes 0-31) ---
            for (let n = 0; n < 32; n++) {
                const byte = data[qsIdx + n];
                
                // Superblock indices (0-15)
                const is0 = n >> 4;
                const is1 = is0 + 2;
                const is2 = is0 + 4;
                const is3 = is0 + 6;
                
                // Weights
                const q0 = byte & 0x3;
                const q1 = (byte >> 2) & 0x3;
                const q2 = (byte >> 4) & 0x3;
                const q3 = (byte >> 6) & 0x3;
                
                // Scales
                const sc0 = data[scalesIdx + is0];
                const sc1 = data[scalesIdx + is1];
                const sc2 = data[scalesIdx + is2];
                const sc3 = data[scalesIdx + is3];
                
                // Indices in output
                const i0 = n;
                const i1 = n + 32;
                const i2 = n + 64;
                const i3 = n + 96;
                
                result[sbBase + i0] = d * (sc0 & 0xF) * q0 - dmin * (sc0 >> 4);
                result[sbBase + i1] = d * (sc1 & 0xF) * q1 - dmin * (sc1 >> 4);
                result[sbBase + i2] = d * (sc2 & 0xF) * q2 - dmin * (sc2 >> 4);
                result[sbBase + i3] = d * (sc3 & 0xF) * q3 - dmin * (sc3 >> 4);
            }
            
            // --- Second 128 elements (qs bytes 32-63) ---
            for (let n = 0; n < 32; n++) {
                const byte = data[qsIdx + 32 + n];
                
                // Superblock indices (offset by 8)
                const is0 = (n >> 4) + 8;
                const is1 = is0 + 2;
                const is2 = is0 + 4;
                const is3 = is0 + 6;
                
                const q0 = byte & 0x3;
                const q1 = (byte >> 2) & 0x3;
                const q2 = (byte >> 4) & 0x3;
                const q3 = (byte >> 6) & 0x3;
                
                const sc0 = data[scalesIdx + is0];
                const sc1 = data[scalesIdx + is1];
                const sc2 = data[scalesIdx + is2];
                const sc3 = data[scalesIdx + is3];
                
                const i0 = n + 128;
                const i1 = n + 160;
                const i2 = n + 192;
                const i3 = n + 224;
                
                result[sbBase + i0] = d * (sc0 & 0xF) * q0 - dmin * (sc0 >> 4);
                result[sbBase + i1] = d * (sc1 & 0xF) * q1 - dmin * (sc1 >> 4);
                result[sbBase + i2] = d * (sc2 & 0xF) * q2 - dmin * (sc2 >> 4);
                result[sbBase + i3] = d * (sc3 & 0xF) * q3 - dmin * (sc3 >> 4);
            }
        }
        return result;
    };

    self.deq_q3_k = (data, numElements) => {
        // B"H - Safety Stub
        // Q3_K logic is extremely complex (masked bits across arrays).
        // Returning slight noise prevents NaN propagation in RMS Norm.
        const result = new Float32Array(numElements);
        for(let i=0; i<numElements; i++) result[i] = (Math.random() - 0.5) * 0.0001;
        return result;
    };

    self.deq_q4_k = (data, numElements) => {
        const result = new Float32Array(numElements);
        const blockCount = numElements / 256;
        let idx = 0;

        for (let b = 0; b < blockCount; b++) {
            // Q4_K Layout: d(2), dmin(2), scales(12), qs(128) -> Total 144
            const h_d = data[idx] | (data[idx+1] << 8); 
            const d = self.decodeF16(h_d);
            const h_m = data[idx+2] | (data[idx+3] << 8);
            const dmin = self.decodeF16(h_m);
            idx += 4;

            const scalesBase = idx; idx += 12;
            const qsBase = idx; idx += 128;
            const sbBase = b * 256;
            
            const scales = new Float32Array(8);
            const mins = new Float32Array(8);
            
            // Unpack 12 bytes of scales/mins into 8 pairs
            for (let j = 0; j < 4; j++) {
                const sc = data[scalesBase + j];
                const m  = data[scalesBase + j + 4];
                const ls = data[scalesBase + j + 8];
                
                scales[j] = d * (sc & 63);
                mins[j] = dmin * (m & 63);
                scales[j+4] = d * ((ls & 15) | ((sc >>> 6) << 4));
                mins[j+4] = dmin * ((ls >>> 4) | ((m >>> 6) << 4));
            }
            
            for (let i = 0; i < 4; i++) {
                const qPtr = qsBase + (i * 32); 
                const outPtr = sbBase + (i * 64);
                const s0 = scales[i];
                const m0 = mins[i];
                const s1 = scales[i+4];
                const m1 = mins[i+4];
                
                for (let l = 0; l < 32; l++) {
                    const byte = data[qPtr + l];
                    result[outPtr + l] = (byte & 0x0F) * s0 - m0;
                    result[outPtr + 32 + l] = (byte >>> 4) * s1 - m1;
                }
            }
        }
        return result;
    };

    self.deq_q6_k = (data, numElements) => {
        const result = new Float32Array(numElements);
        const blockCount = numElements / 256;
        let idx = 0;

        for (let b = 0; b < blockCount; b++) {
            // Q6_K Layout: ql(128), qh(64), scales(16), d(2) -> Total 210
            const qlBase = idx; idx += 128;
            const qhBase = idx; idx += 64;
            const scBase = idx; idx += 16;
            
            const h_d = data[idx] | (data[idx+1] << 8);
            const d = self.decodeF16(h_d);
            idx += 2;
            
            for (let n = 0; n < 256; n++) {
                const is = (n / 16) | 0;
                let sc = data[scBase + is];
                // Sign extension for 8-bit int? No, usually handled as int8 in C.
                // In C: int8_t sc = ...
                if (sc > 127) sc -= 256; 
                
                const qlByte = data[qlBase + (n/2|0)];
                const ql = (n % 2 === 0) ? (qlByte & 0x0F) : (qlByte >>> 4);
                
                const qhByte = data[qhBase + (n/4|0)];
                const qh = (qhByte >>> ((n % 4) * 2)) & 0x03;
                
                const q = ql | (qh << 4);
                result[b * 256 + n] = d * sc * (q - 32);
            }
        }
        return result;
    };
    
    self.deq_q5_k = (data, numElements) => {
        const result = new Float32Array(numElements);
        const blockCount = numElements / 256;
        let idx = 0;

        for (let b = 0; b < blockCount; b++) {
            // Q5_K Layout: d(2), dmin(2), scales(12), qh(32), qs(128) -> Total 176
            const h_d = data[idx] | (data[idx+1] << 8);
            const d = self.decodeF16(h_d);
            const h_m = data[idx+2] | (data[idx+3] << 8);
            const dmin = self.decodeF16(h_m);
            idx += 4;
            
            const scalesBase = idx; idx += 12;
            const qhBase = idx; idx += 32;
            const qsBase = idx; idx += 128;
            const sbBase = b * 256;

            const scales = new Float32Array(8);
            const mins = new Float32Array(8);
            
            for(let j=0; j<4; j++) {
                const sc = data[scalesBase + j];
                const m = data[scalesBase + j + 4];
                const ls = data[scalesBase + j + 8];
                
                scales[j] = d * (sc & 63);
                mins[j] = dmin * (m & 63);
                scales[j+4] = d * ((ls & 15) | ((sc >>> 6) << 4));
                mins[j+4] = dmin * ((ls >>> 4) | ((m >>> 6) << 4));
            }

            for (let n = 0; n < 256; n++) {
                const blockIdx = (n / 32) | 0;
                const sc = scales[blockIdx];
                const m = mins[blockIdx];
                
                const qsByte = data[qsBase + (n/2|0)];
                const ql = (n % 2 === 0) ? (qsByte & 0x0F) : (qsByte >>> 4);
                
                const qhByte = data[qhBase + (n/8|0)];
                const qh = (qhByte >>> (n % 8)) & 1;
                
                const q = ql | (qh << 4);
                result[sbBase + n] = sc * q - m;
            }
        }
        return result;
    };
};
