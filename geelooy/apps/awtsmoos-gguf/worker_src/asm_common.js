
// B"H
/**
 * @module AsmCommon
 * @description
 * The Letters of Creation.
 * Defines the immutable constants and encoding logic for the Wasm binary.
 */
export const AsmCommonSource = () => {
    
    self.WasmConst = {
        MAGIC: [0x00, 0x61, 0x73, 0x6d],
        VERSION: [0x01, 0x00, 0x00, 0x00],
        
        // Sections
        SECTION_TYPE: 1,
        SECTION_IMPORT: 2,
        SECTION_FUNCTION: 3,
        SECTION_MEMORY: 5,
        SECTION_EXPORT: 7,
        SECTION_CODE: 10,

        // Types
        I32: 0x7f,
        F32: 0x7d,
        V128: 0x7b,
        VOID: 0x40,
        FUNC: 0x60,

        // Control Flow
        BLOCK: 0x02,
        LOOP: 0x03,
        BR: 0x0c,
        BR_IF: 0x0d,
        RETURN: 0x0f,
        CALL: 0x10,
        END: 0x0b,

        // Variables
        LOCAL_GET: 0x20,
        LOCAL_SET: 0x21,
        LOCAL_TEE: 0x22,

        // I32 Ops
        I32_CONST: 0x41,
        I32_ADD: 0x6a,
        I32_SUB: 0x6b,
        I32_MUL: 0x6c,
        I32_SHL: 0x74,
        I32_LT_S: 0x48,
        I32_LE_S: 0x4c,
        I32_GE_S: 0x4e,

        // F32 Ops
        F32_CONST: 0x43,
        F32_LOAD: 0x2a,
        F32_STORE: 0x38,
        F32_ADD: 0x92,
        // f32.mul is 0x94
        F32_MUL: 0x94,

        // SIMD Ops (LEB128 Encoded IDs)
        SIMD_PREFIX: 0xfd,
        
        V128_LOAD: [0x00], 
        V128_STORE: [0x0b], 
        V128_CONST: [0x0c],
        V128_SHUFFLE: [0x0d],
        
        // f32x4.add -> ID 228 -> 0xE4 0x01
        F32x4_ADD: [0xe4, 0x01],
        
        // f32x4.mul -> ID 230 -> 0xE6 0x01
        F32x4_MUL: [0xe6, 0x01],
        
        // f32x4.extract_lane -> ID 33 -> 0x21
        F32x4_EXTRACT_LANE: [0x21],
    };

    self.WasmEncoder = {
        /**
         * B"H
         * Encodes an integer as a LEB128 sequence.
         */
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

        // Helper to encode SIMD ops consistently
        simd: (bytes) => {
            return [0xfd, ...bytes];
        },
        
        // Encode locals header: [NumGroups, Count, Type]
        encodeLocal: (count, type) => {
            return [0x01, ...self.WasmEncoder.toLEB128(count), type];
        },
        
        createSection: (id, payload) => {
            return [id, ...self.WasmEncoder.toLEB128(payload.length), ...payload];
        }
    };
};
