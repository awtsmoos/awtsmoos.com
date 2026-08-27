
// B"H
/**
 * @module WasmDefs
 * @description The immutable blueprint of the WebAssembly instruction set.
 */
const WASM = {
    I32: 0x7F, F32: 0x7D, VOID: 0x40,
    BLOCK: 0x02, LOOP: 0x03, IF: 0x04, END: 0x0B,
    BR: 0x0C, BR_IF: 0x0D,
    LOCAL_GET: 0x20, LOCAL_SET: 0x21,
    I32_CONST: 0x41, F32_CONST: 0x43,
    
    I32_ADD: 0x6A, I32_SUB: 0x6B, I32_MUL: 0x6C, I32_DIV_S: 0x6D,
    I32_LT_S: 0x48, I32_GT_S: 0x4E, I32_LE_S: 0x4C, I32_GE_S: 0x50,
    I32_EQ: 0x46, I32_NE: 0x47,
    
    I32_AND: 0x71, I32_OR: 0x72, I32_XOR: 0x73,
    I32_SHL: 0x74, I32_SHR_S: 0x75, I32_SHR_U: 0x76,
    
    F32_ADD: 0x92, F32_SUB: 0x93, F32_MUL: 0x94, F32_DIV: 0x95,
    F32_SQRT: 0x91, F32_NEG: 0x8C, 
    F32_EQ: 0x5B, F32_NE: 0x5C, F32_LT: 0x5D, F32_GT: 0x5E, F32_LE: 0x5F, F32_GE: 0x60,
    
    F32_LOAD: 0x2A, F32_STORE: 0x38,
    I32_LOAD: 0x28, I32_STORE: 0x36,
    I32_LOAD8_S: 0x2C, I32_LOAD8_U: 0x2D, 
    I32_STORE8: 0x3A,
    
    F32_CONVERT_I32_S: 0xB2,
    I32_TRUNC_F32_S: 0xA8,
    
    CALL: 0x10,
    DROP: 0x1A
};

const Encoder = {
    toLEB128: (num) => {
        const bytes = [];
        let n = num;
        while (true) {
            let byte = n & 0x7f;
            n >>>= 7;
            if (n === 0) { bytes.push(byte); break; }
            bytes.push(byte | 0x80);
        }
        return bytes;
    },
    vec: (arr) => {
        let bytes = [];
        for (let item of arr) {
            if (Array.isArray(item) || ArrayBuffer.isView(item)) {
                bytes.push(...item);
            } else {
                bytes.push(item);
            }
        }
        return [...Encoder.toLEB128(arr.length), ...bytes];
    },
    str: (s) => {
        const b = Buffer.from(s);
        return [...Encoder.toLEB128(b.length), ...b];
    },
    ieee754: (v) => {
        const buf = Buffer.allocUnsafe(4);
        buf.writeFloatLE(v, 0);
        return Array.from(buf);
    },
    section: (id, content) => [id, ...Encoder.toLEB128(content.length), ...content]
};

module.exports = { WASM, Encoder };
