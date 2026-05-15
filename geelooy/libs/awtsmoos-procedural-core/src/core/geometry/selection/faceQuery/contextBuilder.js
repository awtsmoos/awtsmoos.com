
/* B"H
*/
/**
 * @file contextBuilder.js
 * @chapter THE VESSEL OF MEMORY
 */

import { route } from '../../../utils/router.js';
import { FaceAdjacency } from '../../selection/faceAdjacency.js';
import { executeQuery } from './executor.js';

const CACHE = { adj: null, mesh: null };

/**
 * @brief Retrieves or builds the face adjacency map.
 */
const getFaceAdjacency = (mesh) => route(CACHE.mesh === mesh && CACHE.adj !== null, {
    'true': () => CACHE.adj,
    'false': () => {
        CACHE.adj = new FaceAdjacency(mesh);
        CACHE.mesh = mesh;
        return CACHE.adj;
    }
});

/**
 * @brief Constructs the evaluation context.
 */
export const buildQueryContext = (mesh, executeQueryFn) => ({
    objectData: mesh.__objectData || null,
    // B"H - Ensuring the execution function is passed down correctly
    executeQuery: executeQueryFn || executeQuery,
    // B"H - TIKKUN: Explicitly mapping the provider function
    getAdjacency: () => getFaceAdjacency(mesh)
});
