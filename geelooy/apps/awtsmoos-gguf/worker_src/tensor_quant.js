
// B"H
/**
 * Dequantization Logic
 */
import { GGML_TYPE } from './tensor_utils.js';

const QK4_0 = 32;
const QK8_0 = 32;

export function dequantize(view, type, numElements) {
    const result = new Float32Array(numElements);

    // F32
    if (type === GGML_TYPE.F32) {
        for (let i = 0; i < numElements; i++) result[i] = view.getFloat32(i * 4, true);
        return result;
    }
    
    // F16
    if (type === GGML_TYPE.F16) {
        for (let i = 0; i < numElements; i++) result[i] = decodeF16(view.getUint16(i * 2, true));
        return result;
    }

    // Q4_0
    if (type === GGML_TYPE.Q4_0) {
        const blockSize = 18; 
        const blockCount = numElements / QK4_0;
        
        for (let b = 0; b < blockCount; b++) {
            const base = b * blockSize;
            const d = decodeF16(view.getUint16(base, true));
            
            for (let i = 0; i < 16; i++) {
                const byte = view.getUint8(base + 2 + i);
                const x0 = (byte & 0x0F) - 8;
                const x1 = (byte >> 4) - 8;
                result[b * QK4_0 + i] = x0 * d;
                result[b * QK4_0 + i + 16] = x1 * d;
            }
        }
        return result;
    }

    // Q8_0
    if (type === GGML_TYPE.Q8_0) {
        const blockSize = 34;
        const blockCount = numElements / QK8_0;
        for (let b = 0; b < blockCount; b++) {
            const base = b * blockSize;
            const d = decodeF16(view.getUint16(base, true));
            for (let i = 0; i < 32; i++) {
                result[b * QK8_0 + i] = view.getInt8(base + 2 + i) * d;
            }
        }
        return result;
    }

    // Q4_K
    if (type === GGML_TYPE.Q4_K) {
        const blockSize = 144;
        const blockCount = numElements / 256;
        
        for (let b = 0; b < blockCount; b++) {
            const base = b * blockSize;
            const d = decodeF16(view.getUint16(base, true));
            const dmin = decodeF16(view.getUint16(base + 2, true));
            
            const scalesBase = base + 4;
            const qsBase = base + 16;
            const sbBase = b * 256;
            
            for (let i = 0; i < 4; i++) {
                const sc = view.getUint8(scalesBase + i);
                const m  = view.getUint8(scalesBase + i + 4);
                const ls = view.getUint8(scalesBase + i + 8);

                const s0 = sc & 0x3F;
                const m0 = m & 0x3F;
                const d0 = d * s0;
                const dm0 = dmin * m0;

                const s1 = (ls & 0x0F) | ((sc >> 6) << 4);
                const m1 = (ls >> 4) | ((m >> 6) << 4);
                const d1 = d * s1;
                const dm1 = dmin * m1;
                
                const qsOffset = qsBase + (i * 32);
                
                // Logical offsets
                const offset0 = sbBase + (i * 32);
                const offset1 = sbBase + ((i + 4) * 32);

                for (let j = 0; j < 32; j++) {
                    const byte = view.getUint8(qsOffset + j);
                    
                    const w0 = (byte & 0x0F);
                    result[offset0 + j] = w0 * d0 - dm0;

                    const w1 = (byte >> 4);
                    result[offset1 + j] = w1 * d1 - dm1;
                }
            }
        }
        return result;
    }

    // Q6_K
    if (type === 14) { // Q6_K
        const blockSize = 210;
        const blockCount = numElements / 256;
        
        for (let b = 0; b < blockCount; b++) {
            const base = b * blockSize;
            const qlBase = base;
            const qhBase = base + 128;
            const scBase = base + 192;
            const dBase = base + 208;
            
            const d = decodeF16(view.getUint16(dBase, true));
            
            for (let n = 0; n < 256; n++) {
                const is = Math.floor(n / 16);
                const sc = view.getInt8(scBase + is);
                
                const ql_byte = view.getUint8(qlBase + Math.floor(n/2));
                const ql = (n % 2 === 0) ? (ql_byte & 0x0F) : (ql_byte >> 4);
                
                const qh_byte = view.getUint8(qhBase + Math.floor(n/4));
                const shift = (n % 4) * 2;
                const qh = (qh_byte >> shift) & 0x03;
                
                const q = ql | (qh << 4);
                result[b * 256 + n] = d * sc * (q - 32);
            }
        }
        return result;
    }

    // Fallback
    console.warn(`Unsupported Quantization Type: ${type}`);
    result.fill(0);
    return result;
}

function decodeF16(h) {
    var s = (h & 0x8000) >> 15;
    var e = (h & 0x7C00) >> 10;
    var f = h & 0x03FF;
    if(e == 0) return (s?-1:1) * Math.pow(2,-14) * (f/1024);
    if(e == 0x1F) return f?NaN:((s?-1:1)*Infinity);
    return (s?-1:1) * Math.pow(2, e-15) * (1 + f/1024);
}
