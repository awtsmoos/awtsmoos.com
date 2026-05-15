
// B"H
/**
 * @file glHelpers.js
 * @brief Atomic helper functions for the sacred rites of WebGL.
 * 
 * THE HYMN OF THE HELPER:
 * A small act of service, a simple command,
 * Executed with care by the Creator's hand.
 * We wrap the complexity, we hide the detail,
 * Ensuring the work of the Spirit won't fail.
 */
export const GLHelpers = {
    /**
     * B"H - Sets up the basic culling and depth states for a draw pass.
     * @param {WebGLRenderingContext} gl 
     * @param {object} obj - The object being drawn.
     */
    prepareState: (gl, obj) => {
        if (obj.doubleSided || obj.isMetaballSurface) {
            gl.disable(gl.CULL_FACE);
        } else {
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.BACK);
        }
    },

    /**
     * B"H - Finalizes the state, returning it to harmonious defaults.
     * @param {WebGLRenderingContext} gl 
     */
    resetState: (gl) => {
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
    },

    /**
     * B"H - Gets the location of a uniform, handling potential void results.
     */
    getLoc: (gl, program, name) => {
        return gl.getUniformLocation(program, name);
    }
};
