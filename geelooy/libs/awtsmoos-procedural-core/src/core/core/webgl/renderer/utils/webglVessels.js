
// B"H
/**
 * @file webglVessels.js
 * @brief Sacred helpers for manipulating the WebGL state machine.
 * 
 * THE HYMN OF THE BINDING HAND:
 * A program is chosen, a shader is lit,
 * Every variable finds a place to fit.
 * We bind the uniforms with a single word,
 * Ensuring the Will of the Essence is heard.
 */

export class WebGLVessels {
    /**
     * B"H - Safely uses a shader program.
     */
    static useProgram(gl, program) {
        if (!gl || !program) return;
        gl.useProgram(program);
    }

    /**
     * B"H - Binds a 4x4 matrix uniform if the location is valid.
     */
    static setMatrix4(gl, loc, mat) {
        if (loc) gl.uniformMatrix4fv(loc, false, mat);
    }

    /**
     * B"H - Binds a 3D vector uniform.
     */
    static setVec3(gl, loc, vec) {
        if (loc) gl.uniform3fv(loc, vec);
    }

    /**
     * B"H - Binds a float uniform.
     */
    static setFloat(gl, loc, val) {
        if (loc) gl.uniform1f(loc, val);
    }
}
