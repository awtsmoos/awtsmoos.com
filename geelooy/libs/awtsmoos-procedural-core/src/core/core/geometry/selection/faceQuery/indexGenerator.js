
/* B"H
*/
/**
 * @file indexGenerator.js
 * @chapter THE SEED OF POTENTIAL
 * 
 * THE PSALM OF THE FIRST COUNT:
 * Before the choice, before the mark,
 * We count each individual spark!
 * From zero to the final face,
 * We map the potential of the space.
 * 
 * @module IndexGenerator
 */

/**
 * @brief Generates a Set containing every face index in the mesh.
 * @param {Object} mesh - The geometric vessel.
 * @returns {Set<number>} The universe of indices.
 */
export const generateUniverse = (mesh) => {
    const universe = new Set();
    const count = (mesh && mesh.faces) ? mesh.faces.length : 0;
    for (let i = 0; i < count; i++) {
        universe.add(i);
    }
    return universe;
};
