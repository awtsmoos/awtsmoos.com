
// B"H
/**
 * @file skyBuffer.js
 * @brief Manages the vertex vessel for the backdrop of existence.
 */

export class SkyBuffer {
    static create(gl) {
        // B"H - A giant triangle covering the entire clip space.
        const verts = new Float32Array([-1, -1, 3, -1, -1, 3]);
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
        return buffer;
    }

    static bind(gl, buffer, program) {
        const loc = gl.getAttribLocation(program, 'aVertexPosition');
        if (loc !== -1) {
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(loc);
        }
    }
}
