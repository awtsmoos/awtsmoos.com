
/**
 * @file HoleShaderConstant.js
 * @description
 * 🔒 CHAPTER 21: THE BOUNDARY OF THE CONSTANT 🔒
 * 
 * To satisfy the strict judgments of the WebGL compiler (Gevurah), 
 * the size of our loop must be an unchanging constant. This prevents 
 * the "forcing loop to unroll" warning that was exhausting the GPU resources.
 */

export const MAX_HOLES_COUNT = 50;

/**
 * @function generateDiscardLogic
 * @description Injects the static loop into the fragment shader.
 */
export function generateDiscardLogic(numHolesUniformName) {
    return `
        for (int i = 0; i < ${MAX_HOLES_COUNT}; i++) {
            if (i >= ${numHolesUniformName}) break;
            if (distance(vAwtsmoosHoleWorldPos, holeCenters[i]) < holeRadii[i]) {
                discard;
            }
        }
    `;
}
