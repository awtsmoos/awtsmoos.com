
// B"H
/**
 * @file composition.js
 * @brief Orchestrating the Matrix Hierarchy.
 * 
 * POETIC REFLECTION:
 * The King's decree (Projection) defines the law,
 * The Minister's sight (View) follows what he saw.
 * To combine them together, Projection comes first,
 * To quench the coordinate's dimensional thirst.
 * We multiply Proj by the View of the Eye,
 * To map the vast world to the screen's humble sky.
 */

import { MatrixMultiplier } from './multiplication.js';

export class MatrixComposer {
    /**
     * B"H - Composes a View-Projection matrix.
     * Order matters! Clip = Proj * View * World.
     * 
     * @param {Float32Array|Array} out - The destination View-Projection matrix.
     * @param {Float32Array|Array} proj - The Projection decree.
     * @param {Float32Array|Array} view - The View perspective.
     * @returns {Float32Array|Array}
     */
    static composeVP(out, proj, view) {
        // Correct WebGL order: Proj * View
        return MatrixMultiplier.execute(out, proj, view);
    }
}
