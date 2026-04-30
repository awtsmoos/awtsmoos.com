
// B"H
/**
 * @module ShaderLimiter
 * @description
 * * Chapter 21: The Boundary of Gevurah (Judgment)
 * In the realm of the GPU, the compiler demands certainty. 
 * If a loop is infinite or its size is variable, the registers 
 * are thrown into chaos, leading to 'X3557' unrolling warnings.
 * * We provide these hard-coded constants as the 'pachad' (boundaries)
 * from which the shader logic cannot stray.
 */

export const SHADER_LIMITS = {
    MAX_HOLES: 50,
    MAX_TEXTURE_SEGMENTS: 200
};

/**
 * @function generateUnrollableLoop
 * @description Generates a GLSL loop string that uses a constant for its size but breaks early based on a uniform.
 */
export function generateUnrollableLoop(countUniform, body, limit) {
    return `
        for (int i = 0; i < ${limit}; i++) {
            if (i >= ${countUniform}) break;
            ${body}
        }
    `;
}
