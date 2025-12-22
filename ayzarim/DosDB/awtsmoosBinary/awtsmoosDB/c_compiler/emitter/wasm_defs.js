// B"H
const WASM = {
    I32: 0x7F, F32: 0x7D, VOID: 0x40,
    BLOCK: 0x02, LOOP: 0x03, IF: 0x04, END: 0x0B,
    BR: 0x0C, BR_IF: 0x0D,
    LOCAL_GET: 0x20, LOCAL_SET: 0x21,
    I32_CONST: 0x41, F32_CONST: 0x43,
    
    I32_ADD: 0x6A, I32_SUB: 0x6B, I32_MUL: 0x6C, I32_LT_S: 0x48,
    F32_ADD: 0x92, F32_SUB: 0x93, F32_MUL: 0x94,
    F32_LOAD: 0x2A, F32_STORE: 0x38,
    I32_SHL: 0x74
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
            // B"H: FIX - Check if iterable before spreading
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
        const b = new ArrayBuffer(4);
        new Float32Array(b)[0] = v;
        return new Uint8Array(b);
    },
    section: (id, content) => [id, ...Encoder.toLEB128(content.length), ...content]
};

module.exports = { WASM, Encoder };