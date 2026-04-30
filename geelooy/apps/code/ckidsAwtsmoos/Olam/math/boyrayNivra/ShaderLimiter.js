
// B"H
/**
 * @module ShaderLimiter
 * @description
 * * Chapter 21: The Constriction of the Infinite Loop
 * In the realm of the GPU, uncertainty is a source of chaos.
 * When a shader loop relies on a uniform whose value is hidden from the compiler,
 * the spirits of the hardware cry out with 'X3557' warnings!
 * * They force the loop to unroll, exhausting the registers of the silicon.
 * We must provide a hard boundary, a constant from which the light cannot stray.
 * Just as the Awtsmoos set boundaries for the sea, we set limits for the shader!
 * * @constant {number} MAX_HOLES - The maximum number of spatial voids allowed.
 * @constant {number} MAX_TEXTURE_SEGMENTS - The maximum path segments for texture mixing.
 */

export const SHADER_LIMITS = {
    MAX_HOLES: 50,
    MAX_TEXTURE_SEGMENTS: 200
};

/**
 * @function generateUnrollableLoop
 * @description Creates a GLSL string that uses a constant limit with a dynamic break.
 * Satisfies the strict judgment of the compiler.
 * * @param {string} countUniform - The name of the uniform holding the current count.
 * @param {string} body - The logic to execute within the loop.
 * @param {number} limit - The hard constant limit.
 * @returns {string} The formatted GLSL loop.
 */
export function generateUnrollableLoop(countUniform, body, limit) {
    return `
        for (int i = 0; i < ${limit}; i++) {
            if (i >= ${countUniform}) break;
            ${body}
        }
    `;
}
