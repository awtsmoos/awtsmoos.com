// B"H
const { GGML_TYPE } = require('./types.js');

const QK4_0 = 32;
const QK8_0 = 32;

// Pre-compute F16 Table (65k entries, ~256KB RAM)
const F16_TABLE = new Float32Array(65536);

(function initF16Table() {
    const buffer = new ArrayBuffer(4);
    const floatView = new Float32Array(buffer);
    for (let i = 0; i < 65536; i++) {
        const s = (i & 0x8000) >> 15;
        const e = (i & 0x7C00) >> 10;
        const f = i & 0x03FF;
        if (e === 0) floatView[0] = (s ? -1 : 1) * Math.pow(2, -14) * (f / 1024);
        else if (e === 0x1F) floatView[0] = f ? NaN : ((s ? -1 : 1) * Infinity);
        else floatView[0] = (s ? -1 : 1) * Math.pow(2, e - 15) * (1 + f / 1024);
        F16_TABLE[i] = floatView[0];
    }
})();

function dequantize(u8, type, numElements, out = null) {
    const result = out || new Float32Array(numElements);

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
            const val = u8[inOffset] | (u8[inOffset + 1] << 8);
            const d = F16_TABLE[val];
            inOffset += 2;

            for (let i = 0; i < 16; i++) {
                const byte = u8[inOffset++];
                const x0 = (byte & 0x0F) - 8;
                result[outOffset + i] = x0 * d;
                const x1 = (byte >> 4) - 8;
                result[outOffset + i + 16] = x1 * d;
            }
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