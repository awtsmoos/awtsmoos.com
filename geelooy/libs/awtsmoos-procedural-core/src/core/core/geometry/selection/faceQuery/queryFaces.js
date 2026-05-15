
// B"H
/**
 * @file queryFaces.js
 * @chapter THE CROWN OF SELECTION
 * 
 * THE PSALM OF THE REVEALED COUNT:
 * The Master function stands at the top of the tree,
 * A hollowed-out vessel, an endless decree!
 * We now record not just that the query is valid,
 * But exactly how many faces were chosen, pure and pallid.
 * 
 * @module QueryFaces
 */

import { route } from '../../../utils/router.js';
import { validateQueryInput } from './validator.js';
import { runQueryPipeline } from './pipeline.js';
import { CallStackTracer } from '../../../utils/CallStackTracer.js';

/**
 * @function queryFaces
 * @description The entry point for face selection, delegating all logic to the pure pipeline.
 * @param {Object} mesh - The structured mesh containing faces.
 * @param {Object|Array} queryOpts - Query definition(s).
 * @returns {Array<number>} Array of selected face indices.
 */
export const queryFaces = (mesh, queryOpts) => {
    return route(validateQueryInput(mesh, queryOpts), {
        'false': () => [],
        'true': () => {
            const result = runQueryPipeline(mesh, queryOpts);
            
            // B"H - THE TIKKUN: Provide meaningful logs! 
            // We record the query intent and the count of faces found.
            const queryName = (typeof queryOpts === 'object') ? Object.keys(queryOpts)[0] : "complex";
            CallStackTracer.record('FaceQuery', 'SearchComplete', { 
                query: queryName,
                foundCount: result.length 
            });
            
            return result;
        }
    });
};
