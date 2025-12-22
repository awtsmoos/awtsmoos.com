
// B"H
const Ops = require('./ops.js');

/**
 * Node.js JIT WASM Assembler & Runtime for AwtsmoosDB
 * Generates specific SIMD kernels for Matrix Multiplication.
 */

// --- 1. Constants (AsmCommon) ---
const C = {
    MAGIC: [0x00, 0x61, 0x73, 0x6d],
    VERSION: [0x01, 0x00, 0x00, 0x00],
    SECTION_TYPE: 1, SECTION_IMPORT: 2, SECTION_FUNCTION: 3, SECTION_EXPORT: 7, SECTION_CODE: 10,
    I32: 0x7f, F32: 0x7d, V128: 0x7b, VOID: 0x40,
    BLOCK: 0x02, LOOP: 0x03, BR: 0x0c, BR_IF: 0x0d, CALL: 0x10, END: 0x0b,
    LOCAL_GET: 0x20, LOCAL_SET: 0x21,
    I32_CONST: 0x41, I32_ADD: 0x6a, I32_SUB: 0x6b, I32_SHL: 0x74, I32_LT_S: 0x48, I32_GE_S: 0x4e,
    F32_CONST: 0x43, F32_LOAD: 0x2a, F32_STORE: 0x38, F32_ADD: 0x92, F32_MUL: 0x94,
    // SIMD
    V128_LOAD: [0x00], V128_STORE: [0x0b], V128_CONST: [0x0c],
    F32x4_MUL: [0xe6, 0x01], F32x4_ADD: [0xe4, 0x01]
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
    simd: (bytes) => [0xfd, ...bytes],
    createSection: (id, payload) => [id, ...Encoder.toLEB128(payload.length), ...payload]
};

// --- 2. Kernels (AsmKernels) ---
const Kernels = {
    generateDot: () => {
        // Locals: 0:ptrA, 1:ptrB, 2:count, 3:acc(v128), 4:scalar_acc(f32)
        const locals = [0x02, 0x01, C.V128, 0x01, C.F32];
        const E = Encoder;
        const code = [
            // Init Acc
            ...E.simd(C.V128_CONST), ...new Array(16).fill(0), C.LOCAL_SET, 3,
            C.F32_CONST, 0, 0, 0, 0, C.LOCAL_SET, 4,
            
            // Loop
            C.BLOCK, C.VOID,
                C.LOOP, C.VOID,
                    C.LOCAL_GET, 2, C.I32_CONST, 8, C.I32_LT_S, C.BR_IF, 1, // Break if count < 8
                    
                    // Unroll 2x (8 floats)
                    C.LOCAL_GET, 0, ...E.simd(C.V128_LOAD), 0, 0,
                    C.LOCAL_GET, 1, ...E.simd(C.V128_LOAD), 0, 0,
                    ...E.simd(C.F32x4_MUL), C.LOCAL_GET, 3, ...E.simd(C.F32x4_ADD), C.LOCAL_SET, 3,

                    C.LOCAL_GET, 0, ...E.simd(C.V128_LOAD), 0, 16,
                    C.LOCAL_GET, 1, ...E.simd(C.V128_LOAD), 0, 16,
                    ...E.simd(C.F32x4_MUL), C.LOCAL_GET, 3, ...E.simd(C.F32x4_ADD), C.LOCAL_SET, 3,

                    // Pointers += 32, Count -= 8
                    C.LOCAL_GET, 0, C.I32_CONST, 32, C.I32_ADD, C.LOCAL_SET, 0,
                    C.LOCAL_GET, 1, C.I32_CONST, 32, C.I32_ADD, C.LOCAL_SET, 1,
                    C.LOCAL_GET, 2, C.I32_CONST, 8, C.I32_SUB, C.LOCAL_SET, 2,
                    C.BR, 0,
                C.END,
            C.END,

            // Reduction: Store v128 to address 0
            C.I32_CONST, 0, C.LOCAL_GET, 3, ...E.simd(C.V128_STORE), 0, 0,
            
            // Sum 4 lanes + scalar acc
            C.I32_CONST, 0, C.F32_LOAD, 0, 0,
            C.I32_CONST, 0, C.F32_LOAD, 0, 4, C.F32_ADD,
            C.I32_CONST, 0, C.F32_LOAD, 0, 8, C.F32_ADD,
            C.I32_CONST, 0, C.F32_LOAD, 0, 12, C.F32_ADD,
            C.LOCAL_GET, 4, C.F32_ADD, C.LOCAL_SET, 4,

            // Tail
            C.BLOCK, C.VOID,
                C.LOOP, C.VOID,
                    C.LOCAL_GET, 2, C.I32_CONST, 0, C.I32_LT_S, C.BR_IF, 1, // if count < 0 break (Logic fix: check > 0)
                    // Simplified tail check: if count <= 0 break
                    C.LOCAL_GET, 2, C.I32_CONST, 0, C.I32_GE_S, C.I32_EQZ, C.BR_IF, 1,

                    C.LOCAL_GET, 0, C.F32_LOAD, 0, 0,
                    C.LOCAL_GET, 1, C.F32_LOAD, 0, 0,
                    C.F32_MUL, C.LOCAL_GET, 4, C.F32_ADD, C.LOCAL_SET, 4,

                    C.LOCAL_GET, 0, C.I32_CONST, 4, C.I32_ADD, C.LOCAL_SET, 0,
                    C.LOCAL_GET, 1, C.I32_CONST, 4, C.I32_ADD, C.LOCAL_SET, 1,
                    C.LOCAL_GET, 2, C.I32_CONST, 1, C.I32_SUB, C.LOCAL_SET, 2,
                    C.BR, 0,
                C.END,
            C.END,
            C.LOCAL_GET, 4, C.END
        ];
        return { locals, code };
    },

    generateMvMul: () => {
        // Locals: 0:ptrMat, 1:ptrVec, 2:ptrOut, 3:rows, 4:cols, 5:i
        const locals = [0x01, 0x01, C.I32];
        const code = [
            C.I32_CONST, 0, C.LOCAL_SET, 5, // i=0
            C.BLOCK, C.VOID,
                C.LOOP, C.VOID,
                    C.LOCAL_GET, 5, C.LOCAL_GET, 3, C.I32_GE_S, C.BR_IF, 1,
                    
                    // Call dot(ptrMat, ptrVec, cols)
                    C.LOCAL_GET, 2, // ptrOut for store
                    C.LOCAL_GET, 0, C.LOCAL_GET, 1, C.LOCAL_GET, 4, C.CALL, 0,
                    C.F32_STORE, 0, 0,

                    // ptrMat += cols * 4 (f32)
                    C.LOCAL_GET, 0, C.LOCAL_GET, 4, C.I32_CONST, 2, C.I32_SHL, C.I32_ADD, C.LOCAL_SET, 0,
                    
                    // ptrOut += 4
                    C.LOCAL_GET, 2, C.I32_CONST, 4, C.I32_ADD, C.LOCAL_SET, 2,
                    
                    // i++
                    C.LOCAL_GET, 5, C.I32_CONST, 1, C.I32_ADD, C.LOCAL_SET, 5,
                    C.BR, 0,
                C.END,
            C.END,
            C.END
        ];
        return { locals, code };
    }
};

// --- 3. Runtime ---
class WasmBackend {
    constructor() {
        this.instance = null;
        this.memory = null;
        this.heapF32 = null;
        
        // Memory Management
        this.scratchPtr = 128; // 0-128 reserved
        this.scratchLimit = 32 * 1024 * 1024; // 32MB Scratch
        
        this.permPtr = this.scratchLimit;
        this.permBase = this.scratchLimit;
        this.weightCache = new Map();
    }

    async init() {
        // Build Binary
        const f0 = Kernels.generateDot();
        const f1 = Kernels.generateMvMul();
        const E = Encoder;
        
        const typeSec = E.createSection(C.SECTION_TYPE, [
            0x02, 
            0x60, 0x03, C.I32, C.I32, C.I32, 0x01, C.F32, // dot
            0x60, 0x05, C.I32, C.I32, C.I32, C.I32, C.I32, 0x00 // mv_mul
        ]);
        
        const initialPages = 32768; // 2GB
        const impSec = E.createSection(C.SECTION_IMPORT, [
            0x01, 0x03, ...Buffer.from("env"), 0x06, ...Buffer.from("memory"),
            0x02, 0x00, ...E.toLEB128(initialPages) // Standard Memory
        ]);
        
        const funcSec = E.createSection(C.SECTION_FUNCTION, [0x02, 0x00, 0x01]);
        const expSec = E.createSection(C.SECTION_EXPORT, [
            0x02, 
            0x03, ...Buffer.from("dot"), 0x00, 0x00,
            0x06, ...Buffer.from("mv_mul"), 0x00, 0x01
        ]);
        
        const body0 = [...f0.locals, ...f0.code];
        const body1 = [...f1.locals, ...f1.code];
        const codeSec = E.createSection(C.SECTION_CODE, [
            0x02, 
            ...E.toLEB128(body0.length), ...body0,
            ...E.toLEB128(body1.length), ...body1
        ]);

        const binary = new Uint8Array([
            ...C.MAGIC, ...C.VERSION,
            ...typeSec, ...impSec, ...funcSec, ...expSec, ...codeSec
        ]);

        // Instantiate
        this.memory = new WebAssembly.Memory({ initial: initialPages });
        this.heapF32 = new Float32Array(this.memory.buffer);
        
        const module = await WebAssembly.instantiate(binary, {
            env: { memory: this.memory }
        });
        
        this.instance = module.instance;
        console.log(`B"H [WASM] JIT Backend Compiled & Loaded. Heap: ${initialPages*64/1024} MB`);
    }

    matVecMul(x, w, n_out) {
        if (!this.instance) return Ops.matVecMulQ4_0(x, w, n_out);
        
        const n_in = x.length;
        if (n_in % 4 !== 0) return Ops.matVecMulQ4_0(x, w, n_out); // Alignment check

        try {
            // Reset Scratch for this op
            this.scratchPtr = 128;
            
            // 1. Allocate X in Scratch
            const bytesX = n_in * 4;
            const ptrX = this.scratchPtr;
            this.scratchPtr += bytesX;
            this.heapF32.set(x, ptrX / 4);

            // 2. Allocate Y in Scratch
            const bytesY = n_out * 4;
            const ptrY = this.scratchPtr;
            this.scratchPtr += bytesY;

            // 3. Manage W in Perm Heap
            let ptrW = this.weightCache.get(w);
            if (!ptrW) {
                const bytesW = w.length * 4;
                // Align to 16
                const aligned = (this.permPtr + 15) & ~15;
                if (aligned + bytesW > this.memory.buffer.byteLength) {
                    // Reset cache if full
                    console.warn(`B"H [WASM] Heap Full. Flushing Cache.`);
                    this.weightCache.clear();
                    this.permPtr = this.permBase;
                    ptrW = (this.permPtr + 15) & ~15;
                } else {
                    ptrW = aligned;
                }
                
                // Copy W (which is likely F32 from dequantize)
                // If W is Q4_0, we need to handle that. 
                // Currently `linear` in inference.js dequantizes to F32 before calling Ops.
                // So `w` here is Float32Array.
                this.heapF32.set(w, ptrW / 4);
                this.permPtr = ptrW + bytesW;
                this.weightCache.set(w, ptrW);
            }

            // 4. Run
            this.instance.exports.mv_mul(ptrW, ptrX, ptrY, n_out, n_in);

            // 5. Read Result
            return this.heapF32.slice(ptrY / 4, (ptrY / 4) + n_out);

        } catch (e) {
            console.error("WASM Trap:", e);
            return Ops.matVecMulQ4_0(x, w, n_out);
        }
    }
}

module.exports = WasmBackend;
