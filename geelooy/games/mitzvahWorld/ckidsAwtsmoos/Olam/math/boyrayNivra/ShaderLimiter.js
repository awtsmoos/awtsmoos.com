
/**
 * @module ShaderLimiter
 * @description
 * B"H
 * 🔒 CHAPTER 21: THE BOUNDARY OF GEVURAH (JUDGMENT) 🔒
 * 
 * In the realm of the GPU, the compiler demands absolute certainty. 
 * "With a span He measured the heavens" — everything must have a fixed boundary.
 * If a loop's limit is a variable (a uniform), the registers are thrown into 
 * chaos, leading to 'X3557' warnings and performance degradation.
 * 
 * We provide these hard-coded constants as the 'pachad' (boundaries)
 * from which the shader logic cannot stray. The loop always runs for the 
 * MAX count, but we 'break' early based on the actual uniform count.
 */

export const SHADER_LIMITS = {
    /** 
     * @constant MAX_HOLES
     * The maximum number of spatial voids allowed in a single material.
     */
    MAX_HOLES: 50,
    
    /** 
     * @constant MAX_TEXTURE_SEGMENTS
     * The maximum number of path segments for texture mixing.
     */
    MAX_TEXTURE_SEGMENTS: 200
};

/**
 * @function generateUnrollableLoop
 * @description 
 * B"H
 * Generates a GLSL loop string that uses a hardcoded constant for its bound.
 * This satisfies the 'unrolling' decree of modern GPU compilers while 
 * allowing dynamic logic through early termination.
 * 
 * @param {string} countUniform - The uniform name representing the actual count.
 * @param {string} body - The GLSL code to execute within the loop.
 * @param {number} limit - The hardcoded constant limit (must be an integer).
 * @returns {string} The final GLSL loop code.
 */
export function generateUnrollableLoop(countUniform, body, limit) {
    return `
        // B"H - Constant bound loop to satisfy unrolling requirements
        for (int i = 0; i < ${limit}; i++) {
            // Early break if we've processed all the intended light
            if (i >= ${countUniform}) break;
            ${body}
        }
    `;
}
