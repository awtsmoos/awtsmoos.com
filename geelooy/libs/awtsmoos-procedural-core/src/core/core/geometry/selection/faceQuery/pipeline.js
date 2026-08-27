
/* B"H
*/
/**
 * @file pipeline.js
 * @chapter THE RIVER OF FILTRATION
 */

import { route } from '../../../utils/router.js';
import { normalizeQuery } from './queryNormalizer.js';
import { sortAndLimitFaces } from './querySorter.js';
import { executeQuery } from './executor.js';
import { buildQueryContext } from './contextBuilder.js';
import { generateUniverse } from './indexGenerator.js';
import { ensureVessel } from './setMath.js';

/**
 * @brief Executes the full pipeline of query normalization, execution, and sorting.
 */
export const runQueryPipeline = (mesh, queryOpts) => route(Array.isArray(queryOpts), {
    'true': () => queryOpts, 
    'false': () => {
        const initialUniverse = generateUniverse(mesh);
        const ctx = buildQueryContext(mesh, executeQuery);
        const subQueries = normalizeQuery(queryOpts);
        
        // B"H - THE TIKKUN: reduce() with a wrapper that FORCES a Set return!
        const finalSet = subQueries.reduce((acc, sq) => {
            const result = executeQuery(mesh, sq, acc, ctx);
            return ensureVessel(result); 
        }, initialUniverse);
        
        return sortAndLimitFaces(mesh, finalSet, queryOpts);
    }
});
