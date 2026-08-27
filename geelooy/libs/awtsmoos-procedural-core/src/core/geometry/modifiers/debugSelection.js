
// B"H
/**
 * @file debugSelection.js
 * @brief A sacred window into the queries of selection.
 * 
 * THE CHRONICLES OF THE WATCHFUL EYE:
 * When the Creator separates the light from the dark, He counts every single spark!
 * This modifier does not alter the physical geometry; it merely queries the faces
 * according to the provided mathematical law, and echoes their count to the console.
 * It is a tool of profound insight, allowing us to verify our Edge and Boundary queries!
 */

import { queryFaces } from '../selection/faceQuery.js';

/**
 * B"H - Logs the resulting count of a face query.
 * @param {object} mesh - The geometric vessel.
 * @param {object} params - The parameters containing the `query` and an optional `message`.
 * @returns {object} The completely unaltered mesh.
 */
export function logSelectionModifier(mesh, params) {
    if (!mesh || !mesh.faces || !params || !params.query) return mesh;

    const indices = queryFaces(mesh, params.query);
    const msg = params.message || 'Sparks found matching the query';
    
    console.log(`B"H - 📜 PROPHECY OF SELECTION: [${msg}] -> Count: ${indices.length}`);
    
    return mesh;
}
