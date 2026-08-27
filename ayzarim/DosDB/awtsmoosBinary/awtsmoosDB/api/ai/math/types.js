
// B"H
// Exact port from awtsmoos-gguf/worker_src/tensor_utils.js

const GGML_TYPE = {
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
    IQ2_XXS: 16,
    IQ2_XS: 17,
    IQ3_XXS: 18,
    IQ1_S: 19,
    IQ4_NL: 20,
    IQ3_S: 21,
    IQ2_S: 22,
    IQ4_XS: 23
};

function getByteSize(type) {
    switch (type) {
        case GGML_TYPE.F32: return { blockElements: 1, blockSize: 4 };
        case GGML_TYPE.F16: return { blockElements: 1, blockSize: 2 };
        case GGML_TYPE.Q4_0: return { blockElements: 32, blockSize: 18 }; 
        case GGML_TYPE.Q4_1: return { blockElements: 32, blockSize: 20 };
        case GGML_TYPE.Q5_0: return { blockElements: 32, blockSize: 22 };
        case GGML_TYPE.Q5_1: return { blockElements: 32, blockSize: 24 };
        case GGML_TYPE.Q8_0: return { blockElements: 32, blockSize: 34 }; 
        case GGML_TYPE.Q8_1: return { blockElements: 32, blockSize: 40 };
        
        // K-Quants
        case GGML_TYPE.Q2_K: return { blockElements: 256, blockSize: 84 };
        case GGML_TYPE.Q3_K: return { blockElements: 256, blockSize: 110 };
        case GGML_TYPE.Q4_K: return { blockElements: 256, blockSize: 144 }; 
        case GGML_TYPE.Q5_K: return { blockElements: 256, blockSize: 176 }; 
        case GGML_TYPE.Q6_K: return { blockElements: 256, blockSize: 210 }; 
        case GGML_TYPE.Q8_K: return { blockElements: 256, blockSize: 256 };
        
        // IQ-Quants
        case GGML_TYPE.IQ2_XXS: return { blockElements: 256, blockSize: 96 }; 
        case GGML_TYPE.IQ4_NL: return { blockElements: 32, blockSize: 18 };
        case GGML_TYPE.IQ3_S: return { blockElements: 256, blockSize: 112 };

        default: return { blockElements: 1, blockSize: 4 }; 
    }
}

module.exports = { GGML_TYPE, getByteSize };
