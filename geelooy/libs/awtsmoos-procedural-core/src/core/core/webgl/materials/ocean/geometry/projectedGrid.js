
// B"H
/**
 * @file projectedGrid.js
 * @brief Constructs a stable, massive flat Cartesian grid designed for integer snapping.
 */

export class ProjectedGrid {
    static create() {
        // B"H - Using 512 segments over 32768 units guarantees exactly 64.0 units per grid square.
        // This is a beautiful power of two, making modulus math absolutely flawless.
        const sideLength = 512;
        const SIZE = 32768.0; 

        const vertDim = sideLength + 1;
        const totalVertices = vertDim * vertDim;
        const totalQuads = sideLength * sideLength;
        
        const posBuffer = new Float32Array(totalVertices * 3);
        const idxBuffer = new Uint32Array(totalQuads * 6);
        const wireBuffer = new Uint32Array((totalQuads * 4) + (sideLength * 4)); 
        
        let pOff = 0;

        for (let row = 0; row <= sideLength; row++) {
            for (let col = 0; col <= sideLength; col++) {
                const px = (col / sideLength) * 2.0 - 1.0; 
                const pz = (row / sideLength) * 2.0 - 1.0; 
                
                posBuffer[pOff++] = px * SIZE;
                posBuffer[pOff++] = 0.0;
                posBuffer[pOff++] = pz * SIZE;
            }
        }

        let tOff = 0;
        let wOff = 0;
        
        for (let r = 0; r < sideLength; r++) {
            for (let c = 0; c < sideLength; c++) {
                const cBL = r * vertDim + c;
                const cBR = cBL + 1;
                const cTL = (r + 1) * vertDim + c;
                const cTR = cTL + 1;
                
                idxBuffer[tOff++] = cBL; idxBuffer[tOff++] = cBR; idxBuffer[tOff++] = cTL;
                idxBuffer[tOff++] = cBR; idxBuffer[tOff++] = cTR; idxBuffer[tOff++] = cTL;
                
                wireBuffer[wOff++] = cBL; wireBuffer[wOff++] = cBR;
                wireBuffer[wOff++] = cBL; wireBuffer[wOff++] = cTL;
            }
        }
        
        for (let fC = 0; fC < sideLength; fC++) {
            wireBuffer[wOff++] = sideLength * vertDim + fC;
            wireBuffer[wOff++] = sideLength * vertDim + fC + 1;
        }
        for (let fR = 0; fR < sideLength; fR++) {
            wireBuffer[wOff++] = fR * vertDim + sideLength;
            wireBuffer[wOff++] = (fR + 1) * vertDim + sideLength;
        }

        return { positions: posBuffer, indices: idxBuffer, wireframeIndices: wireBuffer.subarray(0, wOff) };
    }
}
