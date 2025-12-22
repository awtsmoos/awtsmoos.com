// B"H
const { GGML_TYPE } = require('./types.js');

const QK4_0 = 32;
const QK8_0 = 32;

// --- PRE-COMPUTE F16 TABLE ---
const F16_TABLE = new Float32Array(65536);

(function initF16Table() {
    const buffer = new ArrayBuffer(4);
    const floatView = new Float32Array(buffer);
    
    for (let i = 0; i < 65536; i++) {
        const s = (i & 0x8000) >> 15;
        const e = (i & 0x7C00) >> 10;
        const f = i & 0x03FF;

        if (e === 0) {
            floatView[0] = (s ? -1 : 1) * Math.pow(2, -14) * (f / 1024);
        } else if (e === 0x1F) {
            floatView[0] = f ? NaN : ((s ? -1 : 1) * Infinity);
        } else {
            floatView[0] = (s ? -1 : 1) * Math.pow(2, e - 15) * (1 + f / 1024);
        }
        F16_TABLE[i] = floatView[0];
    }
})();

function dequantize(u8, type, numElements) {
    const result = new Float32Array(numElements);

    if (type === GGML_TYPE.F32) {
        const view = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
        for (let i = 0; i < numElements; i++) result[i] = view.getFloat32(i * 4, true);
        return result;
    }
    
    if (type === GGML_TYPE.F16) {
        for (let i = 0; i < numElements; i++) {
            const val = u8[i*2] | (u8[i*2+1] << 8);
            result[i] = F16_TABLE[val];
        }
        return result;
    }

    if (type === GGML_TYPE.Q4_0) {
        const blockCount = numElements / QK4_0;
        let inOffset = 0;
        let outOffset = 0;

        for (let b = 0; b < blockCount; b++) {
            // 1. Delta
            const val = u8[inOffset] | (u8[inOffset + 1] << 8);
            const d = F16_TABLE[val];
            inOffset += 2;

            // 2. Unrolled 16-byte processing (32 weights)
            // This avoids loop overhead 16 times per block
            
            let byte, x0, x1;

            // 0
            byte = u8[inOffset++];
            result[outOffset] = ((byte & 0x0F) - 8) * d;
            result[outOffset + 16] = ((byte >> 4) - 8) * d;
            // 1
            byte = u8[inOffset++];
            result[outOffset + 1] = ((byte & 0x0F) - 8) * d;
            result[outOffset + 17] = ((byte >> 4) - 8) * d;
            // 2
            byte = u8[inOffset++];
            result[outOffset + 2] = ((byte & 0x0F) - 8) * d;
            result[outOffset + 18] = ((byte >> 4) - 8) * d;
            // 3
            byte = u8[inOffset++];
            result[outOffset + 3] = ((byte & 0x0F) - 8) * d;
            result[outOffset + 19] = ((byte >> 4) - 8) * d;
            // 4
            byte = u8[inOffset++];
            result[outOffset + 4] = ((byte & 0x0F) - 8) * d;
            result[outOffset + 20] = ((byte >> 4) - 8) * d;
            // 5
            byte = u8[inOffset++];
            result[outOffset + 5] = ((byte & 0x0F) - 8) * d;
            result[outOffset + 21] = ((byte >> 4) - 8) * d;
            // 6
            byte = u8[inOffset++];
            result[outOffset + 6] = ((byte & 0x0F) - 8) * d;
            result[outOffset + 22] = ((byte >> 4) - 8) * d;
            // 7
            byte = u8[inOffset++];
            result[outOffset + 7] = ((byte & 0x0F) - 8) * d;
            result[outOffset + 23] = ((byte >> 4) - 8) * d;
            // 8
            byte = u8[inOffset++];
            result[outOffset + 8] = ((byte & 0x0F) - 8) * d;
            result[outOffset + 24] = ((byte >> 4) - 8) * d;
            // 9
            byte = u8[inOffset++];
            result[outOffset + 9] = ((byte & 0x0F) - 8) * d;
            result[outOffset + 25] = ((byte >> 4) - 8) * d;
            // 10
            byte = u8[inOffset++];
            result[outOffset + 10] = ((byte & 0x0F) - 8) * d;
            result[outOffset + 26] = ((byte >> 4) - 8) * d;
            // 11
            byte = u8[inOffset++];
            result[outOffset + 11] = ((byte & 0x0F) - 8) * d;
            result[outOffset + 27] = ((byte >> 4) - 8) * d;
            // 12
            byte = u8[inOffset++];
            result[outOffset + 12] = ((byte & 0x0F) - 8) * d;
            result[outOffset + 28] = ((byte >> 4) - 8) * d;
            // 13
            byte = u8[inOffset++];
            result[outOffset + 13] = ((byte & 0x0F) - 8) * d;
            result[outOffset + 29] = ((byte >> 4) - 8) * d;
            // 14
            byte = u8[inOffset++];
            result[outOffset + 14] = ((byte & 0x0F) - 8) * d;
            result[outOffset + 30] = ((byte >> 4) - 8) * d;
            // 15
            byte = u8[inOffset++];
            result[outOffset + 15] = ((byte & 0x0F) - 8) * d;
            result[outOffset + 31] = ((byte >> 4) - 8) * d;

            outOffset += 32;
        }
        return result;
    }

    if (type === GGML_TYPE.Q8_0) {
        const blockCount = numElements / QK8_0;
        let inOffset = 0;
        let outOffset = 0;

        for (let b = 0; b < blockCount; b++) {
            const val = u8[inOffset] | (u8[inOffset + 1] << 8);
            const d = F16_TABLE[val];
            inOffset += 2;

            for (let i = 0; i < 32; i++) {
                let v = u8[inOffset++];
                if (v > 127) v -= 256;
                result[outOffset++] = v * d;
            }
        }
        return result;
    }
    return result; 
}

module.exports = { dequantize, decodeF16: (l, h) => F16_TABLE[l | (h << 8)], F16_TABLE };