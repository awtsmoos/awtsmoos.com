

// B"H
/**
 * @module AsmKernels
 * @description
 * The logic bodies for the Wasm binary.
 * Implements the "Awtsmoos Kernel" - A Hybrid SIMD approach.
 */
export const AsmKernelSource = () => {

    self.WasmKernels = {
        /**
         * Function 0: dot
         * (ptrA: i32, ptrB: i32, count: i32) -> f32
         */
        generateDot: () => {
            const C = self.WasmConst;
            const E = self.WasmEncoder;

            // Locals: 
            // 0: ptrA, 1: ptrB, 2: count
            // 3: acc (v128)
            // 4: scalar_acc (f32)
            
            const locals = [
                0x02, // 2 Groups
                0x01, C.V128, // 1 x v128 (idx 3)
                0x01, C.F32   // 1 x f32  (idx 4)
            ];

            const code = [
                // 1. Init Accumulator (v128) to 0
                ...E.simd(C.V128_CONST), ...new Array(16).fill(0),
                C.LOCAL_SET, 3,
                
                // Init Scalar Accumulator (f32) to 0.0
                C.F32_CONST, 0x00, 0x00, 0x00, 0x00,
                C.LOCAL_SET, 4,

                // 2. Hybrid Logic: Block 0 -> Block 1 (Turbo) -> Block 2 (Safe)
                C.BLOCK, C.VOID, // Block 0
                    C.BLOCK, C.VOID, // Block 1
                        C.LOOP, C.VOID, // Turbo Loop
                            // Guard: if count < 8 (2x unroll), break to Safe Block
                            // B"H - Simplified to 2x unroll (8 floats) for safety
                            C.LOCAL_GET, 2,
                            C.I32_CONST, 8,
                            C.I32_LT_S,
                            C.BR_IF, 1, // Break to Block 0 (Outer)

                            // Body 2x Unroll
                            C.LOCAL_GET, 0, ...E.simd(C.V128_LOAD), 0x00, 0x00, 
                            C.LOCAL_GET, 1, ...E.simd(C.V128_LOAD), 0x00, 0x00, 
                            ...E.simd(C.F32x4_MUL),
                            C.LOCAL_GET, 3, ...E.simd(C.F32x4_ADD), C.LOCAL_SET, 3,

                            C.LOCAL_GET, 0, ...E.simd(C.V128_LOAD), 0x00, 16,
                            C.LOCAL_GET, 1, ...E.simd(C.V128_LOAD), 0x00, 16,
                            ...E.simd(C.F32x4_MUL),
                            C.LOCAL_GET, 3, ...E.simd(C.F32x4_ADD), C.LOCAL_SET, 3,

                            // Pointers += 32
                            C.LOCAL_GET, 0, C.I32_CONST, 32, C.I32_ADD, C.LOCAL_SET, 0,
                            C.LOCAL_GET, 1, C.I32_CONST, 32, C.I32_ADD, C.LOCAL_SET, 1,
                            
                            // Count -= 8
                            C.LOCAL_GET, 2, C.I32_CONST, 8, C.I32_SUB, C.LOCAL_SET, 2,

                            C.BR, 0, // Repeat Turbo
                        C.END,
                    C.END, // End Turbo Block

                    // Safe Loop (1x) - Handles remainder of 8 (groups of 4)
                    C.LOOP, C.VOID,
                        C.LOCAL_GET, 2,
                        C.I32_CONST, 4,
                        C.I32_LT_S,
                        C.BR_IF, 1, // Break to Reduction

                        C.LOCAL_GET, 0, ...E.simd(C.V128_LOAD), 0x00, 0x00,
                        C.LOCAL_GET, 1, ...E.simd(C.V128_LOAD), 0x00, 0x00,
                        ...E.simd(C.F32x4_MUL),
                        C.LOCAL_GET, 3, ...E.simd(C.F32x4_ADD), C.LOCAL_SET, 3,

                        C.LOCAL_GET, 0, C.I32_CONST, 16, C.I32_ADD, C.LOCAL_SET, 0,
                        C.LOCAL_GET, 1, C.I32_CONST, 16, C.I32_ADD, C.LOCAL_SET, 1,
                        C.LOCAL_GET, 2, C.I32_CONST, 4, C.I32_SUB, C.LOCAL_SET, 2,
                        C.BR, 0,
                    C.END,
                C.END, // End Block 0

                // 3. Reduction (Address 0 store approach)
                // Store v128 to address 0
                C.I32_CONST, 0, // Address
                C.LOCAL_GET, 3, // acc
                ...E.simd(C.V128_STORE), 0x00, 0x00, 

                // Load 4 floats and sum
                C.I32_CONST, 0, C.F32_LOAD, 0x00, 0x00,
                C.I32_CONST, 0, C.F32_LOAD, 0x00, 0x04,
                C.F32_ADD,
                C.I32_CONST, 0, C.F32_LOAD, 0x00, 0x08,
                C.F32_ADD,
                C.I32_CONST, 0, C.F32_LOAD, 0x00, 0x0C,
                C.F32_ADD,

                // Add to scalar acc
                C.LOCAL_GET, 4,
                C.F32_ADD,
                C.LOCAL_SET, 4,

                // 4. Scalar Tail (Handle 0-3 remaining floats)
                C.BLOCK, C.VOID,
                    C.LOOP, C.VOID,
                        C.LOCAL_GET, 2,
                        C.I32_CONST, 0,
                        C.I32_LE_S, 
                        C.BR_IF, 1, 
                        
                        C.LOCAL_GET, 0, C.F32_LOAD, 0x00, 0x00,
                        C.LOCAL_GET, 1, C.F32_LOAD, 0x00, 0x00,
                        C.F32_MUL,
                        C.LOCAL_GET, 4,
                        C.F32_ADD,
                        C.LOCAL_SET, 4,

                        C.LOCAL_GET, 0, C.I32_CONST, 4, C.I32_ADD, C.LOCAL_SET, 0,
                        C.LOCAL_GET, 1, C.I32_CONST, 4, C.I32_ADD, C.LOCAL_SET, 1,
                        C.LOCAL_GET, 2, C.I32_CONST, 1, C.I32_SUB, C.LOCAL_SET, 2,

                        C.BR, 0,
                    C.END,
                C.END,

                C.LOCAL_GET, 4,
                C.END
            ];

            return { locals, code };
        },

        /**
         * Function 1: mv_mul
         * (ptrMat, ptrVec, ptrOut, rows, cols) -> void
         */
        generateMvMul: () => {
            const C = self.WasmConst;
            const E = self.WasmEncoder;

            // Locals: [1 x i32] (Index 5: i)
            const locals = E.encodeLocal(1, C.I32);

            const code = [
                // i = 0
                C.I32_CONST, 0, C.LOCAL_SET, 5,

                C.BLOCK, C.VOID,
                    C.LOOP, C.VOID,
                        // if i >= rows, break
                        C.LOCAL_GET, 5,
                        C.LOCAL_GET, 3,
                        C.I32_GE_S,
                        C.BR_IF, 1,

                        // Prepare Store Address
                        C.LOCAL_GET, 2, // ptrOut

                        // Call dot(ptrMat, ptrVec, cols)
                        C.LOCAL_GET, 0, // ptrMat
                        C.LOCAL_GET, 1, // ptrVec
                        C.LOCAL_GET, 4, // cols
                        C.CALL, 0,

                        // Store f32 (0x38)
                        C.F32_STORE, 0x00, 0x00, 

                        // Update ptrMat += cols * 4
                        C.LOCAL_GET, 0,
                        C.LOCAL_GET, 4, // cols
                        C.I32_CONST, 2,
                        C.I32_SHL,
                        C.I32_ADD,
                        C.LOCAL_SET, 0,

                        // Update ptrOut += 4
                        C.LOCAL_GET, 2,
                        C.I32_CONST, 4,
                        C.I32_ADD,
                        C.LOCAL_SET, 2,

                        // i++
                        C.LOCAL_GET, 5,
                        C.I32_CONST, 1,
                        C.I32_ADD,
                        C.LOCAL_SET, 5,

                        C.BR, 0,
                    C.END,
                C.END,
                C.END
            ];

            return { locals, code };
        }
    };
};