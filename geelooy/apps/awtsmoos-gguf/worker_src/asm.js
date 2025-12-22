
// B"H
/**
 * @module Asm
 * @description
 * The Assembler. The Architect.
 * Implements Dynamic Buffering for robust binary generation.
 */
export const AsmSource = () => {
    
    self.WasmAssembler = class WasmAssembler {
        constructor() {
            if (!self.WasmConst || !self.WasmEncoder || !self.WasmKernels) {
                throw new Error("Asm dependencies missing.");
            }
        }

        buildBinary() {
            const C = self.WasmConst;
            const E = self.WasmEncoder;
            const K = self.WasmKernels;
            
            // 1. Generate Kernel Logic
            const f0 = K.generateDot();
            const f1 = K.generateMvMul();
            
            const body0 = [...f0.locals, ...f0.code];
            const size0 = E.toLEB128(body0.length);
            const func0Entry = [...size0, ...body0];

            const body1 = [...f1.locals, ...f1.code];
            const size1 = E.toLEB128(body1.length);
            const func1Entry = [...size1, ...body1];
            
            // Section 1: Type
            const typePayload = [
                0x02, // count
                // Type 0: dot(ptrA, ptrB, count) -> f32
                0x60, 0x03, C.I32, C.I32, C.I32, 0x01, C.F32, 
                // Type 1: mv_mul(ptrMat, ptrVec, ptrOut, rows, cols) -> void
                0x60, 0x05, C.I32, C.I32, C.I32, C.I32, C.I32, 0x00 
            ];
            const secType = E.createSection(C.SECTION_TYPE, typePayload);

            // Section 2: Import (Memory)
            // Must specify at least 32768 pages (2GB) here or during instantiation to match expectations
            // B"H - Updated to 0x03 (Shared + Max) to match JS SharedArrayBuffer
            const minPages = E.toLEB128(32768);   
            const maxPages = E.toLEB128(32768); 
            
            const importPayload = [
                0x01, // 1 Import
                0x03, ...[0x65, 0x6e, 0x76], // "env"
                0x06, ...[0x6d, 0x65, 0x6d, 0x6f, 0x72, 0x79], // "memory"
                0x02, 0x03, ...minPages, ...maxPages // 0x02=Mem, 0x03=Shared|HasMax
            ];
            const secImport = E.createSection(C.SECTION_IMPORT, importPayload);

            // Section 3: Function
            const funcPayload = [
                0x02, // 2 Funcs
                0x00, // Type index 0
                0x01  // Type index 1
            ];
            const secFunc = E.createSection(C.SECTION_FUNCTION, funcPayload);

            // Section 7: Export
            const exportPayload = [
                0x02, // 2 Exports
                0x03, 0x64, 0x6f, 0x74, 0x00, 0x00, // "dot" -> index 0
                0x06, 0x6d, 0x76, 0x5f, 0x6d, 0x75, 0x6c, 0x00, 0x01 // "mv_mul" -> index 1
            ];
            const secExport = E.createSection(C.SECTION_EXPORT, exportPayload);

            // Section 10: Code
            const codePayload = [
                0x02, // 2 Func Bodies
                ...func0Entry,
                ...func1Entry 
            ];
            const secCode = E.createSection(C.SECTION_CODE, codePayload);

            const buffer = new Uint8Array([
                ...C.MAGIC, ...C.VERSION,
                ...secType,
                ...secImport,
                ...secFunc,
                ...secExport,
                ...secCode
            ]);

            return buffer;
        }
    };
};
