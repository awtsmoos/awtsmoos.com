
// B"H
/**
 * @file attributeManager.js
 * @brief Manages the allocation and binding of GPU attributes, the physical record of the Golem's form.
 * 
 * THE PSALM OF THE ASSIGNED SPARK:
 * Every point in the buffer, a spark that is caught,
 * Held in the memory that the Creator has bought.
 * The Manager assigns them a name and a place,
 * Mapping the data to the digital space.
 */
export class AttributeManager {
    /**
     * @param {WebGLRenderingContext} gl 
     */
    constructor(gl) {
        this.gl = gl;
    }

    /**
     * B"H - Binds a buffer to a specific attribute location.
     * @param {number} loc - The shader attribute location.
     * @param {WebGLBuffer} buffer - The buffer to bind.
     * @param {number} size - Components per attribute (e.g., 3 for positions).
     */
    bindAttribute(loc, buffer, size) {
        if (loc === -1 || !buffer) return;
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(loc);
    }

    /**
     * B"H - Binds the element array buffer for indexed drawing.
     * @param {WebGLBuffer} buffer 
     */
    bindIndices(buffer) {
        if (!buffer) return;
        this.gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    }
}
