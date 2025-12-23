
// B"H
const CCompiler = require('../../../c_compiler/index.js');

/**
 * @module WasmBackend
 * @description The unified sanctuary of mathematical manifestation.
 */
const C_SOURCE = /*c*/`

// B"H: Standard Matrix-Vector Multiplication (Row-Major W)
// y = W * x
void matVecMul(float* out, float* x, float* w, int n_out, int n_in) {
    int i = 0;
    while (i < n_out) {
        float s = 0.0;
        int offset = i * n_in;
        int j = 0;
        // Simple loop, let WASM engine optimize
        while (j < n_in) {
            s = s + w[offset + j] * x[j];
            j = j + 1;
        }
        out[i] = s;
        i = i + 1;
    }
}

void vecMul(float* out, float* a, float* b, int n) {
    int i = 0; 
    while (i < n) { 
        out[i] = a[i] * b[i]; 
        i = i + 1; 
    }
}

void attnSum(float* out, float* scores, float* v_cache, int pos, int head_dim) {
    int i = 0;
    while (i <= pos) {
        float val = scores[i];
        int j = 0; 
        int off = i * head_dim;
        while (j < head_dim) { 
            out[j] = out[j] + val * v_cache[off + j]; 
            j = j + 1; 
        }
        i = i + 1;
    }
}

void rms_norm(float* out, float* x, float* w, int n, float eps) {
    float ss = 0.0;
    int i = 0;
    while (i < n) {
        float v = x[i];
        ss = ss + v * v;
        i = i + 1;
    }
    float mean = ss / n;
    float scale = 1.0 / __builtin_sqrtf(mean + eps);
    
    i = 0;
    while (i < n) {
        out[i] = x[i] * scale * w[i];
        i = i + 1;
    }
}

void rms_norm_with_offset(float* out, float* x, float* w, int n, float eps, float offset) {
    float ss = 0.0;
    int i = 0;
    while (i < n) {
        float v = x[i];
        ss = ss + v * v;
        i = i + 1;
    }
    float mean = ss / n;
    float scale = 1.0 / __builtin_sqrtf(mean + eps);
    
    i = 0;
    while (i < n) {
        out[i] = x[i] * scale * (w[i] + offset);
        i = i + 1;
    }
}

void rms_norm_no_w(float* out, float* x, int n, float eps) {
    float ss = 0.0;
    int i = 0;
    while (i < n) {
        float v = x[i];
        ss = ss + v * v;
        i = i + 1;
    }
    float mean = ss / n;
    float scale = 1.0 / __builtin_sqrtf(mean + eps);
    i = 0;
    while (i < n) {
        out[i] = x[i] * scale;
        i = i + 1;
    }
}

void add_inplace(float* a, float* b, int n) {
    int i = 0;
    while (i < n) {
        a[i] = a[i] + b[i];
        i = i + 1;
    }
}
`;

class WasmBackend {
    constructor() {
        this.instance = null; this.memory = null; this.heapF32 = null; this.heapOffset = 0; this.exports = null;
    }

    async init(pages = 32000) {
        try {
            const bin = CCompiler.compile(C_SOURCE);
            const mod = await WebAssembly.instantiate(bin);
            this.instance = mod.instance; this.exports = this.instance.exports;
            
            // Debug Exports
            // console.log("B\"H [WasmJIT] Exports:", Object.keys(this.exports));
            
            this.memory = this.exports.mem;
            const cur = this.memory.buffer.byteLength / 65536;
            if (cur < pages) this.memory.grow(pages - cur);
            this.heapF32 = new Float32Array(this.memory.buffer);
            this.heapOffset = 0;
            console.log("B\"H [WasmJIT] Safe Kernel Initialized.");
        } catch(e) { console.error("B\"H [WasmJIT] Critical Error:", e); throw e; }
    }

    alloc(bytes) {
        if (!this.memory) return 0;
        const aligned = (bytes + 63) & ~63;
        if (this.heapOffset + aligned > this.memory.buffer.byteLength) {
            const need = (this.heapOffset + aligned) - this.memory.buffer.byteLength;
            this.memory.grow(Math.ceil(need / 65536));
            this.heapF32 = new Float32Array(this.memory.buffer);
        }
        const ptr = this.heapOffset;
        this.heapOffset += aligned;
        return ptr;
    }

    uploadF32(data) {
        if (!data) return 0;
        if (data._wasmPtr !== undefined) return data._wasmPtr;
        
        if (!this.heapF32) return 0;
        const ptr = this.alloc(data.length * 4);
        this.heapF32.set(data, ptr >> 2);
        return ptr;
    }
    
    view(ptr, len) { 
        if (!this.heapF32) return null;
        const v = this.heapF32.subarray(ptr >> 2, (ptr >> 2) + len);
        v._wasmPtr = ptr;
        v._wasmLon = len;
        return v;
    }
    
    // B"H: Strict Validator - Rejects NaN AND Infinity
    isValid(view) {
        if (!view) return false;
        const len = view.length;
        for(let i=0; i<len; i++) {
            if (!Number.isFinite(view[i])) return false;
        }
        return true;
    }

    copyIn(ptr, data) {
        if (!data) return;
        let source = data;
        if (data._wasmPtr !== undefined) {
             source = this.heapF32.subarray(data._wasmPtr >> 2, (data._wasmPtr >> 2) + data._wasmLon);
        }
        this.heapF32.set(source, ptr >> 2);
    }

    copyOut(view) {
        if (!view) return null;
        if (view._wasmPtr !== undefined) {
             const fresh = this.heapF32.subarray(view._wasmPtr >> 2, (view._wasmPtr >> 2) + view._wasmLon);
             return new Float32Array(fresh);
        }
        return new Float32Array(view);
    }
}

module.exports = new WasmBackend();
