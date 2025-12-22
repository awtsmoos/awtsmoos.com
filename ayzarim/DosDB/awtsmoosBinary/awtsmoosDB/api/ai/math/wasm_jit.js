// B"H
const CCompiler = require('../../../c_compiler/index.js');

// Standard C Kernel for Matrix Multiplication
// This kernel uses manual unrolling and float arithmetic.
const C_SOURCE = `
// B"H - Matrix Vector Mul Kernel
void run(float* out, float* x, float* w, int n_out, int n_in) {
    int i = 0;
    while (i < n_out) {
        float sum = 0.0;
        int j = 0;
        
        // Main Loop (Unrolled 8x manually for speed)
        while (j < n_in - 7) {
            int base = i * n_in;
            sum = sum + w[base + j]     * x[j];
            sum = sum + w[base + j + 1] * x[j + 1];
            sum = sum + w[base + j + 2] * x[j + 2];
            sum = sum + w[base + j + 3] * x[j + 3];
            sum = sum + w[base + j + 4] * x[j + 4];
            sum = sum + w[base + j + 5] * x[j + 5];
            sum = sum + w[base + j + 6] * x[j + 6];
            sum = sum + w[base + j + 7] * x[j + 7];
            j = j + 8;
        }
        
        // Remainder
        while (j < n_in) {
            int base = i * n_in;
            sum = sum + w[base + j] * x[j];
            j = j + 1;
        }
        
        out[i] = sum;
        i = i + 1;
    }
}
`;

class WasmBackend {
    constructor() {
        this.instance = null;
        this.memory = null;
        this.heapF32 = null;
        this.heapOffset = 0;
    }

    async init(initialPages = 256) {
        console.log("B\"H [WasmJIT] Compiling C Kernel via Modular Compiler...");
        
        try {
            const binary = CCompiler.compile(C_SOURCE);
            
            // FULL HEX DUMP (Formatted)
            console.log(`B"H [WasmJIT] Binary Size: ${binary.length} bytes`);
            
            let hexLines = [];
            let currentLine = "";
            for (let i = 0; i < binary.length; i++) {
                const byte = binary[i].toString(16).padStart(2, '0').toUpperCase();
                currentLine += byte + " ";
                if ((i + 1) % 16 === 0) {
                    hexLines.push(currentLine);
                    currentLine = "";
                }
            }
            if (currentLine) hexLines.push(currentLine);
            console.log(hexLines.join('\n'));
            console.log("---------------------------------------------------");

            const module = await WebAssembly.instantiate(binary);
            this.instance = module.instance;
            this.memory = this.instance.exports.mem;
            
            // Grow if needed
            if (this.memory.buffer.byteLength < initialPages * 65536) {
                const curPages = this.memory.buffer.byteLength / 65536;
                const needed = initialPages - curPages;
                if (needed > 0) this.memory.grow(needed);
            }
            
            this.heapF32 = new Float32Array(this.memory.buffer);
            this.fn = this.instance.exports.run;
            this.heapOffset = 0;
            console.log("B\"H [WasmJIT] Active and Ready.");
            
        } catch(e) {
            console.error("B\"H [WasmJIT] Compiler Error:", e);
            throw e; 
        }
    }

    alloc(sizeBytes) {
        const ptr = this.heapOffset;
        const aligned = (sizeBytes + 7) & ~7;
        
        if (this.heapOffset + aligned > this.memory.buffer.byteLength) {
            const needed = (this.heapOffset + aligned) - this.memory.buffer.byteLength;
            const pages = Math.ceil(needed / 65536);
            this.memory.grow(pages);
            this.heapF32 = new Float32Array(this.memory.buffer);
        }
        this.heapOffset += aligned;
        return ptr;
    }

    uploadF32(data) {
        const ptr = this.alloc(data.length * 4);
        this.heapF32.set(data, ptr >> 2);
        return ptr;
    }
}

module.exports = new WasmBackend();