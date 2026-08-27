

// B"H
/**
 * @module MathKernels
 * The dense foundations of calculation, where millions of multiplications 
 * are performed in an instant, mimicking the constant creation of the world 
 * from the singular point of the Awtsmoos.
 */
export const MathKernelsSource = () => {
    self.dotProduct = (vecA, vecB) => {
        let sum = 0;
        const len = vecA.length;
        for (let i = 0; i < len; i++) sum += vecA[i] * vecB[i];
        return isNaN(sum) || !isFinite(sum) ? 0 : sum;
    };

    /**
     * The Pure JavaScript implementation of Matrix-Vector Multiplication.
     * Serves as the reliable vessel (Kli) when the high-speed light (Wasm)
     * cannot be contained (e.g. alignment mismatches).
     */
    self.matVecMulJS = (x, w, n_out) => {
        const n_in = x.length;
        const y = new Float32Array(n_out);
        for (let i = 0; i < n_out; i++) {
            const offset = i * n_in;
            let sum = 0;
            // Unrolling 4x for numerical stability and performance
            let j = 0;
            for (; j < n_in - 3; j += 4) {
                sum += w[offset + j] * x[j];
                sum += w[offset + j + 1] * x[j + 1];
                sum += w[offset + j + 2] * x[j + 2];
                sum += w[offset + j + 3] * x[j + 3];
            }
            for (; j < n_in; j++) sum += w[offset + j] * x[j];
            y[i] = isNaN(sum) ? 0 : sum;
        }
        return y;
    };

    self.matVecMul = (x, w, n_out) => {
        if (!w) return new Float32Array(n_out);

        // B"H - Turbo Switch
        // If the Assembler has generated the machine code, use it.
        if (self.env && self.env.useWasm && self.wasmMatVecMul) {
             return self.wasmMatVecMul(x, w, n_out);
        }

        return self.matVecMulJS(x, w, n_out);
    };

    self.matVecMul_Q8_0 = (x, bytes, n_out) => {
        // WASM Q8 not yet implemented in Turbo, fallback to JS
        const n_in = x.length;
        const y = new Float32Array(n_out);
        const blockSize = 34;
        const blockCount = n_in / 32;
        for (let i = 0; i < n_out; i++) {
            let sum = 0;
            const rowOffset = i * blockCount * blockSize;
            for (let b = 0; b < blockCount; b++) {
                const ptr = rowOffset + (b * blockSize);
                const delta = self.decodeF16(bytes[ptr] | (bytes[ptr + 1] << 8));
                const inOff = b * 32;
                for (let k = 0; k < 32; k++) {
                    const weight = (bytes[ptr + 2 + k] << 24) >> 24; 
                    sum += x[inOff + k] * (weight * delta);
                }
            }
            y[i] = isNaN(sum) ? 0 : sum;
        }
        return y;
    };
};