
// B"H
// File: /BH/awtsmoos.com/ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/api/ai/math/wasm_jit.js

const C = {
    MAGIC: [0x00, 0x61, 0x73, 0x6d],
    VERSION: [0x01, 0x00, 0x00, 0x00],
    SECTION_TYPE: 1, SECTION_IMPORT: 2, SECTION_FUNCTION: 3, SECTION_EXPORT: 7, SECTION_CODE: 10,
    I32: 0x7f, F32: 0x7d, V128: 0x7b, VOID: 0x40,
    
    // Instructions
    LOCAL_GET: 0x20, LOCAL_SET: 0x21,
    I32_CONST: 0x41, I32_ADD: 0x6a, I32_SUB: 0x6b, I32_AND: 0x71, I32_SHR_U: 0x77,
    F32_LOAD: 0x2a, F32_STORE: 0x38, F32_ADD: 0x92, F32_MUL: 0x94,
    
    // SIMD
    V128_LOAD: [0x00], V128_CONST: [0x0c],
    I8x16_SPLAT: [0x0f],
    I8x16_EXTRACT_LANE_S: [0x15],
    F32x4_ADD: [0xe4, 0x01], F32x4_MUL: [0xe6, 0x01],
    F32x4_SPLAT: [0x13, 0xfd], // Prefix 0xfd is handled by helper
    
    // Custom logic helpers
    BLOCK: 0x02, LOOP: 0x03, BR: 0x0c, BR_IF: 0x0d, END: 0x0b
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
    createSection: (id, payload) => [id, ...Encoder.toLEB128(payload.length), ...payload]
};

class WasmBackend {
    constructor() {
        this.instance = null;
        this.memory = null;
        this.heapU8 = null;
        this.heapF32 = null;
        this.ptr_x = 0;
        this.ptr_w = 0;
        this.ptr_out = 0;
    }

    async init(initialPages = 256) { // 16MB Start
        // 1. Define Type: (x_ptr, w_ptr, n_blocks) -> float_result
        const typeSec = Encoder.createSection(C.SECTION_TYPE, [
            0x01, 
            0x60, 0x03, C.I32, C.I32, C.I32, 0x01, C.F32 
        ]);

        // 2. Imports
        const impSec = Encoder.createSection(C.SECTION_IMPORT, [
            0x01, 0x02, ...Buffer.from("js"), 0x03, ...Buffer.from("mem"),
            0x02, 0x00, ...Encoder.toLEB128(initialPages)
        ]);

        // 3. Function Declarations
        const funcSec = Encoder.createSection(C.SECTION_FUNCTION, [0x01, 0x00]);

        // 4. Exports
        const expSec = Encoder.createSection(C.SECTION_EXPORT, [
            0x01, 0x09, ...Buffer.from("dot_q4_0"), 0x00, 0x00
        ]);

        // 5. Code Body (The Logic)
        // param 0: ptr_x (F32 array)
        // param 1: ptr_w (Q4_0 Block array)
        // param 2: n_blocks (iterations)
        
        // Block Layout Q4_0 (18 bytes):
        // 0-1: scale (F16) -> we treat as F16 but JS usually parses this. 
        // For simplicity in V1 we will dequantize scale in JS and pass it? 
        // NO. To be fast, Wasm must read bytes.
        // Q4_0 Layout: 
        // Bytes 0-1: Delta (float16)
        // Bytes 2-17: 32 nibbles (qs)
        
        // This handwritten assembly is complex. For immediate results, we will write a "Float-Only" fallback 
        // that assumes we pass 2 Float32Arrays, but we compile it to Wasm so it's faster than JS.
        // Later we can implement the Q4 dequantizer in Wasm.
        
        const codeBody = [
            // Locals: 0:ptr_x, 1:ptr_w, 2:n, 3:sum(f32), 4:i(i32)
            0x02, 0x01, C.F32, 0x01, C.I32, 
            
            C.F32_CONST, 0, 0, 0, 0, C.LOCAL_SET, 3, // sum = 0
            C.I32_CONST, 0, C.LOCAL_SET, 4,          // i = 0
            
            C.BLOCK, C.VOID,
            C.LOOP, C.VOID,
                C.LOCAL_GET, 4, C.LOCAL_GET, 2, C.I32_GE_S, C.BR_IF, 1, // if i >= n break
                
                // Load X[i]
                C.LOCAL_GET, 0, C.LOCAL_GET, 4, C.I32_CONST, 2, C.I32_SHL, C.I32_ADD, C.F32_LOAD, 0, 0,
                // Load W[i]
                C.LOCAL_GET, 1, C.LOCAL_GET, 4, C.I32_CONST, 2, C.I32_SHL, C.I32_ADD, C.F32_LOAD, 0, 0,
                
                C.F32_MUL,
                C.LOCAL_GET, 3, C.F32_ADD, C.LOCAL_SET, 3, // sum += x*w
                
                C.LOCAL_GET, 4, C.I32_CONST, 1, C.I32_ADD, C.LOCAL_SET, 4, // i++
                C.BR, 0,
            C.END,
            C.END,
            
            C.LOCAL_GET, 3, C.END
        ];

        const codeSec = Encoder.createSection(C.SECTION_CODE, [
            0x01, ...Encoder.toLEB128(codeBody.length), ...codeBody
        ]);

        const binary = new Uint8Array([
            ...C.MAGIC, ...C.VERSION,
            ...typeSec, ...impSec, ...funcSec, ...expSec, ...codeSec
        ]);

        this.memory = new WebAssembly.Memory({ initial: initialPages });
        this.heapU8 = new Uint8Array(this.memory.buffer);
        this.heapF32 = new Float32Array(this.memory.buffer);
        
        const module = await WebAssembly.instantiate(binary, {
            js: { mem: this.memory }
        });
        
        this.instance = module.instance;
        this.dot = this.instance.exports.dot_q4_0;
        
        // Pointers for reuse
        this.ptr_x = 0; 
        // 1MB for X vector (holds up to 256k dim)
        this.ptr_w = 1024 * 1024; 
    }

    /**
     * Fast Dot Product using Wasm
     * Copies data into Wasm Heap and runs loop.
     * Note: This is "Phase 1" optimization (compiled loop).
     * "Phase 2" requires implementing Q4 dequant logic inside Wasm to save copy time.
     */
    runDot(x, w) {
        if (!this.instance) return 0;
        
        // 1. Copy Data (Bottleneck, but faster than JS math loop)
        this.heapF32.set(x, this.ptr_x >> 2);
        this.heapF32.set(w, this.ptr_w >> 2); // W must be F32 for this temporary kernel
        
        return this.dot(this.ptr_x, this.ptr_w, x.length);
    }
}

module.exports = new WasmBackend();