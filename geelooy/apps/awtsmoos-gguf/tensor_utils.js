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
};

export function getByteSize(type) {
    // Returns { blockElements, blockSize }
    switch (type) {
        case GGML_TYPE.F32: return { blockElements: 1, blockSize: 4 };
        case GGML_TYPE.F16: return { blockElements: 1, blockSize: 2 };
        case GGML_TYPE.Q4_0: return { blockElements: 32, blockSize: 18 }; // 2 (f16) + 16 (uint8)
        case GGML_TYPE.Q8_0: return { blockElements: 32, blockSize: 34 }; // 2 (f16) + 32 (int8)
        default: return { blockElements: 1, blockSize: 4 }; // Fallback
    }
}