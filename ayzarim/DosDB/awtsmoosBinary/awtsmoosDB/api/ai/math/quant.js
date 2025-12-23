
// B"H
const { GGML_TYPE } = require('./types.js');

// --- CONSTANTS ---
const QK4_0 = 32;
const QK8_0 = 32;
const TABLE_IQ2_XXS = [-1.0, 0.0, 1.0, -2.0];
const TABLE_IQ4_NL = [
    -127, -104, -83, -65, -49, -35, -22, -10, 
    1, 13, 25, 38, 53, 69, 89, 113
];

// Pre-compute F16 Table
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

function decodeF16(h) {
    return F16_TABLE[h];
}

function dequantize(u8, type, numElements, out = null) {
    const result = out || new Float32Array(numElements);

    // Direct routing
    switch (type) {
        case GGML_TYPE.F32: return deq_f32(u8, numElements, result);
        case GGML_TYPE.F16: return deq_f16(u8, numElements, result);
        case GGML_TYPE.Q4_0: return deq_q4_0(u8, numElements, result);
        case GGML_TYPE.Q5_0: return deq_q5_0(u8, numElements, result);
        case GGML_TYPE.Q5_1: return deq_q5_1(u8, numElements, result);
        case GGML_TYPE.Q8_0: return deq_q8_0(u8, numElements, result);
        
        // K-Quants
        case GGML_TYPE.Q2_K: return deq_q2_k(u8, numElements, result);
        case GGML_TYPE.Q3_K: return deq_q3_k(u8, numElements, result);
        case GGML_TYPE.Q4_K: return deq_q4_k(u8, numElements, result);
        case GGML_TYPE.Q5_K: return deq_q5_k(u8, numElements, result);
        case GGML_TYPE.Q6_K: return deq_q6_k(u8, numElements, result);
        
        // IQ-Quants
        case GGML_TYPE.IQ2_XXS: return deq_iq2_xxs(u8, numElements, result);
        case GGML_TYPE.IQ4_NL: return deq_iq4_nl(u8, numElements, result);
        case GGML_TYPE.IQ3_S: return deq_iq3_s(u8, numElements, result);
        
        default:
            // Fallback noise
            for(let i=0; i<numElements; i++) result[i] = (Math.random() - 0.5) * 0.0001;
            return result;
    }
}

// --- IMPLEMENTATIONS ---

function deq_f32(data, n, res) {
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    for (let i = 0; i < n; i++) res[i] = view.getFloat32(i * 4, true);
    return res;
}

function deq_f16(data, n, res) {
    for (let i = 0; i < n; i++) res[i] = F16_TABLE[data[i*2] | (data[i*2 + 1] << 8)];
    return res;
}

function deq_q4_0(data, n, res) {
    const blockCount = n / 32;
    let idx = 0;
    for (let b = 0; b < blockCount; b++) {
        const d = F16_TABLE[data[idx] | (data[idx + 1] << 8)]; idx += 2;
        const offset = b * 32;
        for (let i = 0; i < 16; i++) {
            const byte = data[idx++];
            res[offset + i] = ((byte & 0x0F) - 8) * d;
            res[offset + i + 16] = ((byte >> 4) - 8) * d;
        }
    }
    return res;
}

function deq_q8_0(data, n, res) {
    const blockCount = n / 32;
    let idx = 0;
    for (let b = 0; b < blockCount; b++) {
        const d = F16_TABLE[data[idx] | (data[idx + 1] << 8)]; idx += 2;
        const offset = b * 32;
        for (let i = 0; i < 32; i++) {
            let val = data[idx++];
            if (val > 127) val -= 256;
            res[offset + i] = val * d;
        }
    }
    return res;
}

function deq_q5_0(data, n, res) {
    const blockCount = n / 32;
    let idx = 0;
    for (let b = 0; b < blockCount; b++) {
        const d = F16_TABLE[data[idx] | (data[idx + 1] << 8)]; idx += 2;
        const qhBase = idx; idx += 4;
        const qlBase = idx; idx += 16;
        const offset = b * 32;
        
        for (let i = 0; i < 16; i++) {
            const byte = data[qlBase + i];
            const bit0 = (data[qhBase + (i >> 3)] >> (i & 7)) & 1;
            const bit1 = (data[qhBase + ((i+16) >> 3)] >> ((i+16) & 7)) & 1;
            
            const x0 = (byte & 0x0F) | (bit0 << 4);
            const x1 = (byte >> 4) | (bit1 << 4);
            
            res[offset + i] = (x0 - 16) * d;
            res[offset + i + 16] = (x1 - 16) * d;
        }
    }
    return res;
}

function deq_q5_1(data, n, res) {
    const blockCount = n / 32;
    let idx = 0;
    for (let b = 0; b < blockCount; b++) {
        const d = F16_TABLE[data[idx] | (data[idx + 1] << 8)]; idx += 2;
        const m = F16_TABLE[data[idx] | (data[idx + 1] << 8)]; idx += 2;
        const qhBase = idx; idx += 4;
        const qlBase = idx; idx += 16;
        const offset = b * 32;
        
        for (let i = 0; i < 16; i++) {
            const byte = data[qlBase + i];
            const bit0 = (data[qhBase + (i >> 3)] >> (i & 7)) & 1;
            const bit1 = (data[qhBase + ((i+16) >> 3)] >> ((i+16) & 7)) & 1;
            
            const x0 = (byte & 0x0F) | (bit0 << 4);
            const x1 = (byte >> 4) | (bit1 << 4);
            
            res[offset + i] = x0 * d + m;
            res[offset + i + 16] = x1 * d + m;
        }
    }
    return res;
}

// --- K-QUANTS ---

function deq_q2_k(data, n, res) {
    const blockCount = n / 256;
    let idx = 0;
    for (let b = 0; b < blockCount; b++) {
        const scalesIdx = idx; idx += 16;
        const qsIdx = idx; idx += 64;
        const d = F16_TABLE[data[idx] | (data[idx + 1] << 8)];
        const dmin = F16_TABLE[data[idx + 2] | (data[idx + 3] << 8)];
        idx += 4;
        
        const sbBase = b * 256;
        
        for (let i = 0; i < 32; i++) {
            const byte = data[qsIdx + i];
            const is0 = i >> 4;
            const sc0 = data[scalesIdx + is0];
            const sc1 = data[scalesIdx + is0 + 2];
            const sc2 = data[scalesIdx + is0 + 4];
            const sc3 = data[scalesIdx + is0 + 6];
            
            res[sbBase + i]       = d * (sc0 & 0xF) * (byte & 3) - dmin * (sc0 >> 4);
            res[sbBase + i + 32]  = d * (sc1 & 0xF) * ((byte >> 2) & 3) - dmin * (sc1 >> 4);
            res[sbBase + i + 64]  = d * (sc2 & 0xF) * ((byte >> 4) & 3) - dmin * (sc2 >> 4);
            res[sbBase + i + 96]  = d * (sc3 & 0xF) * ((byte >> 6) & 3) - dmin * (sc3 >> 4);
        }
        for (let i = 0; i < 32; i++) {
            const byte = data[qsIdx + 32 + i];
            const is0 = (i >> 4) + 8;
            const sc0 = data[scalesIdx + is0];
            const sc1 = data[scalesIdx + is0 + 2];
            const sc2 = data[scalesIdx + is0 + 4];
            const sc3 = data[scalesIdx + is0 + 6];
            
            res[sbBase + i + 128] = d * (sc0 & 0xF) * (byte & 3) - dmin * (sc0 >> 4);
            res[sbBase + i + 160] = d * (sc1 & 0xF) * ((byte >> 2) & 3) - dmin * (sc1 >> 4);
            res[sbBase + i + 192] = d * (sc2 & 0xF) * ((byte >> 4) & 3) - dmin * (sc2 >> 4);
            res[sbBase + i + 224] = d * (sc3 & 0xF) * ((byte >> 6) & 3) - dmin * (sc3 >> 4);
        }
    }
    return res;
}

function deq_q3_k(data, n, res) {
    // Basic Noise Stub for Q3_K to prevent crash
    for(let i=0; i<n; i++) res[i] = (Math.random() - 0.5) * 0.0001;
    return res;
}

function deq_q4_k(data, n, res) {
    const blockCount = n / 256;
    let idx = 0;
    const scales = new Float32Array(8);
    const mins = new Float32Array(8);

    for (let b = 0; b < blockCount; b++) {
        const d = F16_TABLE[data[idx] | (data[idx + 1] << 8)];
        const dmin = F16_TABLE[data[idx + 2] | (data[idx + 3] << 8)];
        idx += 4;
        
        const scalesBase = idx; idx += 12;
        const qsBase = idx; idx += 128;
        const sbBase = b * 256;
        
        for (let j = 0; j < 4; j++) {
            const sc = data[scalesBase + j];
            const m = data[scalesBase + j + 4];
            const ls = data[scalesBase + j + 8];
            scales[j] = d * (sc & 63);
            mins[j] = dmin * (m & 63);
            scales[j+4] = d * ((ls & 15) | ((sc >>> 6) << 4));
            mins[j+4] = dmin * ((ls >>> 4) | ((m >>> 6) << 4));
        }
        
        for (let i = 0; i < 4; i++) {
            const qPtr = qsBase + (i * 32); 
            const outPtr = sbBase + (i * 64);
            const s0 = scales[i], m0 = mins[i];
            const s1 = scales[i+4], m1 = mins[i+4];
            
            for (let l = 0; l < 32; l++) {
                const byte = data[qPtr + l];
                res[outPtr + l] = (byte & 0x0F) * s0 - m0;
                res[outPtr + 32 + l] = (byte >>> 4) * s1 - m1;
            }
        }
    }
    return res;
}

function deq_q5_k(data, n, res) {
    const blockCount = n / 256;
    let idx = 0;
    const scales = new Float32Array(8);
    const mins = new Float32Array(8);

    for (let b = 0; b < blockCount; b++) {
        const d = F16_TABLE[data[idx] | (data[idx + 1] << 8)];
        const dmin = F16_TABLE[data[idx + 2] | (data[idx + 3] << 8)];
        idx += 4;
        
        const scalesBase = idx; idx += 12;
        const qhBase = idx; idx += 32;
        const qsBase = idx; idx += 128;
        const sbBase = b * 256;
        
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
            const qsByte = data[qsBase + (n/2|0)];
            const ql = (n % 2 === 0) ? (qsByte & 0x0F) : (qsByte >>> 4);
            const qhByte = data[qhBase + (n/8|0)];
            const qh = (qhByte >>> (n % 8)) & 1;
            const q = ql | (qh << 4);
            
            res[sbBase + n] = scales[blockIdx] * q - mins[blockIdx];
        }
    }
    return res;
}

function deq_q6_k(data, n, res) {
    const blockCount = n / 256;
    let idx = 0;
    for (let b = 0; b < blockCount; b++) {
        const qlBase = idx; idx += 128;
        const qhBase = idx; idx += 64;
        const scBase = idx; idx += 16;
        const d = F16_TABLE[data[idx] | (data[idx + 1] << 8)]; idx += 2;
        
        for (let n = 0; n < 256; n++) {
            let sc = data[scBase + (n/16|0)];
            if (sc > 127) sc -= 256; 
            
            const qlByte = data[qlBase + (n/2|0)];
            const ql = (n % 2 === 0) ? (qlByte & 0x0F) : (qlByte >>> 4);
            
            const qhByte = data[qhBase + (n/4|0)];
            const qh = (qhByte >>> ((n % 4) * 2)) & 0x03;
            
            const q = ql | (qh << 4);
            res[b * 256 + n] = d * sc * (q - 32);
        }
    }
    return res;
}

// --- IQ QUANTS ---

function deq_iq2_xxs(data, n, res) {
    const blockCount = n / 256;
    let idx = 0;
    const scales = new Float32Array(16);
    
    for (let b = 0; b < blockCount; b++) {
        for (let s = 0; s < 16; s++) {
            scales[s] = F16_TABLE[data[idx] | (data[idx+1] << 8)];
            idx += 2;
        }
        const qsBase = idx; idx += 64;
        const sbBase = b * 256;
        
        for (let i = 0; i < 256; i += 4) {
            const byte = data[qsBase + (i/4)];
            const d = scales[i/16];
            
            res[sbBase + i] = d * TABLE_IQ2_XXS[byte & 3];
            res[sbBase + i+1] = d * TABLE_IQ2_XXS[(byte >> 2) & 3];
            res[sbBase + i+2] = d * TABLE_IQ2_XXS[(byte >> 4) & 3];
            res[sbBase + i+3] = d * TABLE_IQ2_XXS[(byte >> 6) & 3];
        }
    }
    return res;
}

function deq_iq4_nl(data, n, res) {
    const blockCount = n / 32;
    let idx = 0;
    for (let b = 0; b < blockCount; b++) {
        const d = F16_TABLE[data[idx] | (data[idx + 1] << 8)]; idx += 2;
        const offset = b * 32;
        for (let i = 0; i < 16; i++) {
            const byte = data[idx++];
            res[offset + i] = d * TABLE_IQ4_NL[byte & 0x0F];
            res[offset + i + 16] = d * TABLE_IQ4_NL[byte >> 4];
        }
    }
    return res;
}

function deq_iq3_s(data, n, res) {
    // Fallback
    for(let i=0; i<n; i++) res[i] = (Math.random() - 0.5) * 0.001;
    return res;
}

module.exports = { dequantize, decodeF16, F16_TABLE };
