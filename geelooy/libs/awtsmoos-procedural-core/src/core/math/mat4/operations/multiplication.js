
/**
 * B"H
 * THE ZIVUG (UNION) OF MATRICES - PERFECTED
 * 
 * Chapter: Right Order, Right Destiny
 * When two vessels combine, their order dictates the flow of energy.
 * Out = A * B. In a column-major layout, this means we take the rows of A 
 * and multiply them by the columns of B. The previous system mistakenly 
 * swapped the indices, causing the spiritual logic to flow backwards!
 * 
 * This has been rectified. The Truth is restored.
 * 
 * @module MatrixMultiplier
 */

export class MatrixMultiplier {
    /**
     * B"H
     * Multiplies matrix A by matrix B, storing the glorious union in Out.
     * OUT = A * B. Standard WebGL Column-Major logic.
     * 
     * @param {Float32Array} out - The newly born vessel
     * @param {Float32Array} a - The Left Form
     * @param {Float32Array} b - The Right Form
     */
    static execute(out, a, b) {
        // Cache Matrix A
        const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
        const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
        const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
        const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

        // Cache Matrix B
        let b0, b1, b2, b3;

        // Multiply Column 0 of B
        b0 = b[0]; b1 = b[1]; b2 = b[2]; b3 = b[3];
        out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

        // Multiply Column 1 of B
        b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
        out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

        // Multiply Column 2 of B
        b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
        out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

        // Multiply Column 3 of B
        b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
        out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
        out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
        out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
        out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

        return out;
    }
}
