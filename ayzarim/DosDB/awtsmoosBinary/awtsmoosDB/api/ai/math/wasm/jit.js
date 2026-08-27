
// B"H
const CCompiler = require('../../../../c_compiler/index.js');

const genQ4_0_Kernel = () => {
    let code = `
    void matVecMul_q4_0(float* out, float* x, char* quants, float* scales, int n_out, int n_blocks) {
        int i = 0; char* q_ptr = quants; float* s_ptr = scales; float* out_ptr = out;
        while (i < n_out) {
            float sum = 0.0f; int k = 0; float* x_ptr = x;
            while (k < n_blocks) {
                float s = *s_ptr; s_ptr = s_ptr + 4;
                float bs0 = 0.0f; float bs1 = 0.0f; float bs2 = 0.0f; float bs3 = 0.0f;
    `;
    for(let j=0; j<16; j++) {
        const acc0 = `bs${(j * 2) % 4}`; const acc1 = `bs${(j * 2 + 1) % 4}`;
        code += `
                int byte_${j} = q_ptr[${j}];
                float val_lo_${j} = (float)((byte_${j} & 15) - 8); float x0_${j} = x_ptr[${j*2}];
                ${acc0} = ${acc0} + val_lo_${j} * x0_${j};
                float val_hi_${j} = (float)((byte_${j} >> 4) - 8); float x1_${j} = x_ptr[${j*2+1}];
                ${acc1} = ${acc1} + val_hi_${j} * x1_${j};
        `;
    }
    code += `
                sum = sum + (bs0 + bs1 + bs2 + bs3) * s;
                q_ptr = q_ptr + 16; x_ptr = x_ptr + 128; k = k + 1;
            }
            *out_ptr = sum; out_ptr = out_ptr + 4; i = i + 1;
        }
    }
    `;
    return code;
};

const C_SOURCE = /*c*/`
float fast_tanh(float x) {
    if (x > 4.97f) return 1.0f;
    if (x < -4.97f) return -1.0f;
    float x2 = x * x;
    float n_c0 = 135135.0f; float n_c1 = 17325.0f; float n_c2 = 378.0f;
    float n_t1 = n_c2 + x2; float n_t2 = n_c1 + x2 * n_t1; float a = x * (n_c0 + x2 * n_t2);
    float d_c0 = 135135.0f; float d_c1 = 62370.0f; float d_c2 = 3150.0f; float d_c3 = 28.0f;
    float d_t1 = d_c2 + x2 * d_c3; float d_t2 = d_c1 + x2 * d_t1; float b = d_c0 + x2 * d_t2;
    return a / b;
}

${genQ4_0_Kernel()}

void matVecMul(float* out, float* x, float* w, int n_out, int n_in) {
    int i = 0; float* out_ptr = out; float* w_ptr = w;
    while (i < n_out) {
        float s = 0.0f; int j = 0; float* x_ptr = x;
        float s0 = 0.0f; float s1 = 0.0f; float s2 = 0.0f; float s3 = 0.0f;
        while (j <= n_in - 8) {
            s0 = s0 + w_ptr[0] * x_ptr[0] + w_ptr[4] * x_ptr[4];
            s1 = s1 + w_ptr[1] * x_ptr[1] + w_ptr[5] * x_ptr[5];
            s2 = s2 + w_ptr[2] * x_ptr[2] + w_ptr[6] * x_ptr[6];
            s3 = s3 + w_ptr[3] * x_ptr[3] + w_ptr[7] * x_ptr[7];
            w_ptr = w_ptr + 32; x_ptr = x_ptr + 32; j = j + 8;
        }
        s = s0 + s1 + s2 + s3;
        while (j < n_in) { s = s + (*w_ptr) * (*x_ptr); w_ptr = w_ptr + 4; x_ptr = x_ptr + 4; j = j + 1; }
        *out_ptr = s; out_ptr = out_ptr + 4; i = i + 1;
    }
}
void vec_mul_inplace(float* target, float* src, int n) { int i = 0; while (i < n) { target[i] = target[i] * src[i]; i = i + 1; } }
void gelu_inplace(float* x, int n) {
    float coef = 0.044715f; float sqrt_2_pi = 0.7978845608f; int i = 0;
    while(i < n) { float v = x[i]; float v3 = v * v * v; float inner = v + coef * v3; float arg = sqrt_2_pi * inner; float tanh_val = fast_tanh(arg); float factor = 1.0f + tanh_val; x[i] = 0.5f * v * factor; i = i + 1; }
}
void silu_inplace(float* x, int n) { int i = 0; while(i < n) { float v = x[i]; float arg = v * 0.5f; float tanh_val = fast_tanh(arg); float sig = 0.5f * (tanh_val + 1.0f); x[i] = v * sig; i = i + 1; } }
void rms_norm(float* out, float* x, float* w, int n, float eps) {
    float ss = 0.0f; int i = 0; while (i < n) { ss = ss + x[i] * x[i]; i = i + 1; }
    float scale = 1.0f / sqrt((ss / (float)n) + eps); i = 0; while (i < n) { out[i] = x[i] * scale * w[i]; i = i + 1; }
}
void rms_norm_with_offset(float* out, float* x, float* w, int n, float eps, float offset) {
    float ss = 0.0f; int i = 0; while (i < n) { ss = ss + x[i] * x[i]; i = i + 1; }
    float scale = 1.0f / sqrt((ss / (float)n) + eps); i = 0; while (i < n) { out[i] = x[i] * scale * (w[i] + offset); i = i + 1; }
}
void rms_norm_no_w(float* out, float* x, int n, float eps) {
    float ss = 0.0f; int i = 0; while (i < n) { ss = ss + x[i] * x[i]; i = i + 1; }
    float scale = 1.0f / sqrt((ss / (float)n) + eps); i = 0; while (i < n) { out[i] = x[i] * scale; i = i + 1; }
}
void add_inplace(float* a, float* b, int n) { int i = 0; while (i < n) { a[i] = a[i] + b[i]; i = i + 1; } }
`;

class WasmBackend {
    constructor() { this.instance = null; this.memory = null; this.heapF32 = null; this.heapU8 = null; this.permanentPtr = 0; this.scratchBase = 0; this.scratchPtr = 0; this.exports = null; }
    async init(pages = 32768) { 
        try {
            const bin = CCompiler.compile(C_SOURCE); const mod = await WebAssembly.instantiate(bin);
            this.instance = mod.instance; this.exports = this.instance.exports; this.memory = this.exports.mem;
            const cur = this.memory.buffer.byteLength / 65536; if (cur < pages) { try { this.memory.grow(pages - cur); } catch(e) { if (pages > 16384) return this.init(16384); throw e; } }
            this.heapF32 = new Float32Array(this.memory.buffer); this.heapU8 = new Uint8Array(this.memory.buffer);
            this.permanentPtr = 1024; this.scratchBase = 1610612736; this.scratchPtr = this.scratchBase;
            console.log(`B"H [WasmJIT] Hyper-Kernel Initialized. Regions: Permanent=1.5GB, Total=${(this.memory.buffer.byteLength/1024/1024/1024).toFixed(1)}GB`);
        } catch(e) { throw e; }
    }
    _refreshView() { if (!this.heapF32 || this.heapF32.buffer !== this.memory.buffer) { this.heapF32 = new Float32Array(this.memory.buffer); this.heapU8 = new Uint8Array(this.memory.buffer); } }
    allocPermanent(bytes) { const aligned = (bytes + 63) & ~63; if (this.permanentPtr + aligned > this.scratchBase) throw new Error("WASM Perm Overflow"); if (this.permanentPtr + aligned > this.memory.buffer.byteLength) { this.memory.grow(Math.ceil((this.permanentPtr+aligned - this.memory.buffer.byteLength)/65536)); this._refreshView(); } const ptr = this.permanentPtr; this.permanentPtr += aligned; return ptr; }
    allocScratch(bytes) { const aligned = (bytes + 63) & ~63; if (this.scratchPtr + aligned > this.memory.buffer.byteLength) { this.memory.grow(Math.ceil((this.scratchPtr+aligned - this.memory.buffer.byteLength)/65536)); this._refreshView(); } const ptr = this.scratchPtr; this.scratchPtr += aligned; return ptr; }
    resetScratch() { this.scratchPtr = this.scratchBase; }
    uploadF32(data) { if (!data) return 0; if (data._wasmPtr !== undefined) return data._wasmPtr; this._refreshView(); const ptr = this.allocPermanent(data.length * 4); this.heapF32.set(data, ptr >> 2); data._wasmPtr = ptr; return ptr; }
    uploadU8(data) { this._refreshView(); const ptr = this.allocPermanent(data.length); this.heapU8.set(data, ptr); return ptr; }
    view(ptr, len) { this._refreshView(); const v = this.heapF32.subarray(ptr >> 2, (ptr >> 2) + len); v._wasmPtr = ptr; v._wasmLon = len; return v; }
    isValid(view) { if (!view) return false; const len = view.length; for(let i=0; i<len; i++) if (!Number.isFinite(view[i])) return false; return true; }
    copyIn(ptr, data) { if (!data) return; this._refreshView(); let source = data; if (data._wasmPtr !== undefined) { source = this.heapF32.subarray(data._wasmPtr >> 2, (data._wasmPtr >> 2) + data._wasmLon); } this.heapF32.set(source, ptr >> 2); }
    copyOut(view) { if (!view) return null; this._refreshView(); if (view._wasmPtr !== undefined) { const fresh = this.heapF32.subarray(view._wasmPtr >> 2, (view._wasmPtr >> 2) + view._wasmLon); return new Float32Array(fresh); } return new Float32Array(view); }
}
module.exports = new WasmBackend();
