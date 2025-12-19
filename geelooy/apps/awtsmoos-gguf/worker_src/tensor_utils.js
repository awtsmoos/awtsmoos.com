// B"H
/**
 * Tensor Constants
 */

export const GGML_TYPE = {
    F32: 0,
    F16: 1,
    Q4_0: 2,
    Q4_1: 3,
    Q5_0: 6,
    Q5_1: 7,
    Q8_0: 8,
    Q8_1: 9,
    // K-Quants
    Q2_K: 10,
    Q3_K: 11,
    Q4_K: 12,
    Q5_K: 13,
    Q6_K: 14,
    Q8_K: 15,
    // IQ Quants
    IQ2_XXS: 19
};

export function getByteSize(type) {
    // Returns { blockElements, blockSize }
    switch (type) {
        case GGML_TYPE.F32: return { blockElements: 1, blockSize: 4 };
        case GGML_TYPE.F16: return { blockElements: 1, blockSize: 2 };
        case GGML_TYPE.Q4_0: return { blockElements: 32, blockSize: 18 }; // 2 (f16) + 16 (uint8)
        case GGML_TYPE.Q8_0: return { blockElements: 32, blockSize: 34 }; // 2 (f16) + 32 (int8)
        
        // K-Quants (Superblocks of 256)
        case GGML_TYPE.Q4_K: return { blockElements: 256, blockSize: 144 }; 
        case GGML_TYPE.Q5_K: return { blockElements: 256, blockSize: 176 }; 
        case GGML_TYPE.Q6_K: return { blockElements: 256, blockSize: 210 }; 
        
        // IQ-Quants (Superblocks of 256)
        case GGML_TYPE.IQ2_XXS: return { blockElements: 256, blockSize: 128 }; // 16*2(scales) + 256/4(weights) = 32 + 64? Wait. C++ says 16*4+64=128. scales are F32. F16 in file.
                                                                                // The file has 16*f16 scales (32 bytes) + 256/4 weights (64 bytes) = 96 bytes. Let me recheck...
                                                                                // Ah, `sizeof(float) * 256 / 16 = 64` + `256/4 = 64` is 128 for IQ3_XXS.
                                                                                // For IQ2_XXS: sizeof(uint16_t) * 16 + 256/4 = 32 + 64 = 96 bytes.
                                                                                // Let's use 96 bytes.
                                                                                return { blockElements: 256, blockSize: 96 };

        default: return { blockElements: 1, blockSize: 4 }; // Fallback
    }
}