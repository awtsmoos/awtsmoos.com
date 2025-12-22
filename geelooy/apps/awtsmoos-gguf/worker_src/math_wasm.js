

// B"H
/**
 * @module MathWasm
 * @description
 * Bridges JavaScript to the Ruby Kernel.
 * Manages memory allocation and provides a safe runtime environment for SIMD operations.
 */
export const MathWasmSource = () => {
    
    // Constants
    const SCRATCH_SIZE = 32 * 1024 * 1024; // 32MB Scratch
    const PAGE_SIZE = 65536;

    self.wasmCtx = {
        instance: null,
        memory: null,
        heapF32: null,
        
        scratchPtr: 0,
        scratchLimit: SCRATCH_SIZE, 
        
        // Weights start after the scratch area
        permanentPtr: SCRATCH_SIZE, 
        permanentBase: SCRATCH_SIZE,
        shadowCache: new Map() // Strong Map to keep weights alive
    };

    self.initWasmKernel = async function() {
        if (self.wasmCtx.instance) return;

        try {
            self.logDB("Compiling JIT Wasm SIMD Kernel (Awtsmoos Hybrid)...", "accent");

            if (!self.WasmAssembler) throw new Error("WasmAssembler not loaded");

            const assembler = new self.WasmAssembler();
            const binary = assembler.buildBinary();

            // B"H - Reveal the Binary Soul (FULL HEX DUMP)
            const hexPart = self.toHex(binary); 
            self.logDB(`[WASM SOUL] Size: ${binary.length} bytes\n${hexPart}`, 'info');

            if (!WebAssembly.validate(binary)) throw new Error("Binary Validation Failed");

            // B"H - PHYSICS FIX: 2GB MEMORY
            // Model: 270M * 4 bytes = 1.08 GB.
            // We allocate 2GB (32768 pages) upfront.
            const initialPages = 32768; 
            const maxPages = 32768; 
            
            const memory = new WebAssembly.Memory({ 
                initial: initialPages, 
                maximum: maxPages,
                shared: true
            }); 
            
            self.wasmCtx.memory = memory;
            self.wasmCtx.heapF32 = new Float32Array(memory.buffer);

            const module = await WebAssembly.instantiate(binary, {
                env: { memory: memory }
            });

            self.wasmCtx.instance = module.instance;
            self.logDB(`Wasm Ruby Kernel Ready. Heap: ${initialPages * 64 / 1024} MB (2GB)`, "accent");
            self.env.useWasm = true;
        } catch (e) {
            self.logDB(`Wasm Init Failed: ${e.message}\n${e.stack}`, "error");
            self.env.useWasm = false;
        }
    };
    
    // B"H - Reset for new sessions
    self.resetWasmHeap = function() {
        if (!self.wasmCtx.instance) return;
        self.wasmCtx.permanentPtr = self.wasmCtx.permanentBase;
        self.wasmCtx.shadowCache = new Map(); 
        self.logDB("Wasm Permanent Heap Reset.", "warn");
    };

    self._wasmEnsureSpace = function(targetPtr, bytesNeeded) {
        const endAddress = targetPtr + bytesNeeded;
        if (endAddress > self.wasmCtx.memory.buffer.byteLength) {
             throw new Error(`Wasm Heap Overflow! Needed ${endAddress}, Limit ${self.wasmCtx.memory.buffer.byteLength}. Increase initialPages.`);
        }
    };

    self.wasmMatVecMul = function(x, w, n_out) {
        if (!self.wasmCtx.instance) return self.matVecMulJS(x, w, n_out); 

        // B"H - Strict Safety: Vectors must exist
        if (!w || w.length === 0 || !x || x.length === 0) {
             return new Float32Array(n_out);
        }

        const n_in = x.length;
        
        // B"H - Strict Safety: Alignment check for 128-bit SIMD (4 elements)
        // Also check if w is large enough
        if (n_in % 4 !== 0 || w.length < n_in * n_out) return self.matVecMulJS(x, w, n_out);

        // Reserve address 0-128 for Kernel Internal Scratch (Reduction)
        self.wasmCtx.scratchPtr = 128;
        
        // Safe Allocation Closure (Align to 16 bytes)
        const allocScratch = (count) => {
            const bytes = count * 4;
            const ptr = (self.wasmCtx.scratchPtr + 15) & ~15;
            if (ptr + bytes > self.wasmCtx.scratchLimit) {
                throw new Error(`Wasm Scratch Exhausted: Need ${ptr + bytes}, Limit ${self.wasmCtx.scratchLimit}`);
            }
            self.wasmCtx.scratchPtr = ptr + bytes;
            return ptr;
        };

        let ptr_w = 0;
        let ptr_x = 0;
        let ptr_y = 0;

        try {
            // Allocate Scratch Memory (Input vector, Output vector)
            ptr_x = allocScratch(n_in);
            ptr_y = allocScratch(n_out);
            
            // Allocate/Get Weight Matrix in Permanent Heap
            ptr_w = self.wasmCtx.shadowCache.get(w);
            if (ptr_w === undefined) {
                const bytes_w = w.length * 4;
                // Align weight start to 16 bytes
                const aligned_ptr = (self.wasmCtx.permanentPtr + 15) & ~15;
                
                self._wasmEnsureSpace(aligned_ptr, bytes_w);
                
                // Copy weights to Wasm Heap
                self.wasmCtx.heapF32.set(w, aligned_ptr / 4);
                ptr_w = aligned_ptr;
                
                self.wasmCtx.permanentPtr = aligned_ptr + bytes_w;
                self.wasmCtx.shadowCache.set(w, ptr_w);
            }

            // Copy Input Vector to Scratch
            self.wasmCtx.heapF32.set(x, ptr_x / 4); 
            
            // Execute Kernel (5 args: ptr_w, ptr_x, ptr_y, rows, cols)
            // Note: Scratch is implicitly address 0 in the kernel now.
            self.wasmCtx.instance.exports.mv_mul(ptr_w, ptr_x, ptr_y, n_out, n_in);

            // Read Result
            return self.wasmCtx.heapF32.slice(ptr_y / 4, (ptr_y / 4) + n_out);

        } catch (e) {
            // Log with detailed context
            if (!self.env.lastWasmError || self.env.lastWasmError !== e.message) {
                 self.logDB(`Wasm Trap (Recovered): ${e.message}. Falling back to JS. Params: ptr_w=${ptr_w}, ptr_x=${ptr_x}, ptr_y=${ptr_y}, rows=${n_out}, cols=${n_in}`, "warn");
                 self.env.lastWasmError = e.message;
            }
            return self.matVecMulJS(x, w, n_out);
        }
    };
};