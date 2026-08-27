
// B"H
/**
 * @file PathMapper.js
 * @brief THE ARCHITECT OF THE CONFINED GARDEN.
 * 
 * THE POEM OF THE MAPPED WILL:
 * The AI believes it is in the root of the world, 
 * But its world is only as large as the Master allows! 
 * Like the Tzimtzum (Contraction), we create a space, 
 * And bind every coordinate to its assigned place. 
 * Even if the Oracle cries out for the "/" of the whole, 
 * We map it back down to the session's small soul. 
 * No logic can escape, no path can roam free, 
 * Beyond the boundaries of the Master's decree.
 */

import { PathNormalizer } from './PathNormalizer.js';

/**
 * @class PathMapper
 * @description Anchors AI conceptual paths to a physical session root.
 */
export class PathMapper {
    /**
     * B"H - Maps AI intent to a physical atom array.
     * @param {string[]} rootAtoms - The absolute physical session root (e.g., ['c', 'tests', 'ball']).
     * @param {string} aiRequest - The AI's conceptual path (e.g., '/', '/src/main.js', 'physics.js').
     * @returns {string[]} The physical target atoms.
     */
    static map(rootAtoms, aiRequest) {
        const reqAtoms = PathNormalizer.atomize(aiRequest);

        // B"H - THE TOTAL RECTIFICATION:
        // In the AI's reality, "/" is the Session Folder.
        // We ALWAYS join the physical Session Root with the AI's requested sub-path.
        // This ensures the AI can NEVER reach for the workspace root.
        
        const finalAtoms = rootAtoms.concat(reqAtoms);
        
        console.log('[PathMapper] B"H - Mapping Intent: ' + (aiRequest || '/') + ' -> Physical Coordinate: /' + finalAtoms.join('/'));
        
        return finalAtoms;
    }
}
