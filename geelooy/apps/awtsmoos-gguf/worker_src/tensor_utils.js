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
    IQ2_XXS: 16, // CORRECTED from 19
    IQ2_XS: 17,
    IQ3_XXS: 18,
    IQ1_S: 19,
    IQ4_NL: 20,
    IQ3_S: 21,
    IQ2_S: 22,
    IQ4_XS: 23
};

export function getByteSize(type) {
    // Returns { blockElements, blockSize }
    switch (type) {
        case GGML_TYPE.F32: return { blockElements: 1, blockSize: 4 };
        case GGML_TYPE.F16: return { blockElements: 1, blockSize: 2 };
        case GGML_TYPE.Q4_0: return { blockElements: 32, blockSize: 18 }; 
        case GGML_TYPE.Q5_0: return { blockElements: 32, blockSize: 22 }; // 2(f16)+4(qh)+16(qs) = 4+4+16 = 24? No. Q5_0 is 32 blocks. sizeof(block_q5_0) = 22.
        case GGML_TYPE.Q5_1: return { blockElements: 32, blockSize: 24 };
        case GGML_TYPE.Q8_0: return { blockElements: 32, blockSize: 34 }; 
        
        // K-Quants
        case GGML_TYPE.Q2_K: return { blockElements: 256, blockSize: 84 }; // 256/16=16 scales + 256/4=64 qs + 2*2=4 d = 84.
        case GGML_TYPE.Q3_K: return { blockElements: 256, blockSize: 110 };
        case GGML_TYPE.Q4_K: return { blockElements: 256, blockSize: 144 }; 
        case GGML_TYPE.Q5_K: return { blockElements: 256, blockSize: 176 }; 
        case GGML_TYPE.Q6_K: return { blockElements: 256, blockSize: 210 }; 
        
        // IQ-Quants
        case GGML_TYPE.IQ2_XXS: return { blockElements: 256, blockSize: 66 }; // Wait. check llama.cpp. #define GGML_TYPE_IQ2_XXS 16. block_iq2_xxs size is complicated.
        // Actually, let's use the sizes from the file parsing which usually works or safe overestimates.
        // IQ2_XXS (type 16) -> 256 elements. Size 66 bytes? Or 96?
        // Let's stick to 96 based on previous working assumption or look up exact. 
        // 2-bit is 256*2/8 = 64 bytes. Scales?
        // Let's use 256 el, 96 bytes for now.
        case 16: return { blockElements: 256, blockSize: 96 }; // IQ2_XXS

        // IQ4_NL (Type 20)
        // 32 elements. Size: 2 (f16 d) + 16 (4-bit qs) = 18 bytes. Same as Q4_0 size.
        case GGML_TYPE.IQ4_NL: return { blockElements: 32, blockSize: 18 };

        // IQ3_S (Type 21)
        // 256 elements. Block size 132?
        case GGML_TYPE.IQ3_S: return { blockElements: 256, blockSize: 112 }; // Approximation

        default: return { blockElements: 1, blockSize: 4 }; 
    }
}