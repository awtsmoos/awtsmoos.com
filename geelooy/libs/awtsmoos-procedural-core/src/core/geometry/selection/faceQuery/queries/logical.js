
// B"H
/**
 * @file logical.js
 * @chapter THE PILLARS OF GEVURAH
 * 
 * THE HYMN OF THE DIVIDED LIGHT:
 * The mind seeks to combine, to exclude, to define,
 * Across the boundaries of the geometric line.
 * "And" brings the overlap, the union of intent,
 * "Or" gathers the fragments that the heavens have sent.
 * "Inverse" flips the world, making the dark be bright,
 * Under the watchful eye of the Creator's might.
 * 
 * @module LogicalQueries
 */

import { ensureVessel, intersect, unite, invert } from '../setMath.js';
import { route } from '../../../../utils/router.js';

export const LOGICAL_QUERIES = Object.freeze({
    /**
     * @function inverse
     * @description Negates the result of a sub-query against the current universe.
     */
    'inverse': (m, p, i, ctx) => {
        const toInvert = ensureVessel(ctx.executeQuery(m, p, i, ctx));
        return invert(i, toInvert);
    },

    /**
     * @function and
     * @description Performs a sequential intersection of multiple sub-queries.
     * Each step filters the result of the previous step.
     */
    'and': (m, p, i, ctx) => {
        const isValid = Array.isArray(p);
        return route(isValid, {
            'true': () => p.reduce((acc, subQ) => {
                // Evaluate the current sub-query against the accumulated filtered set
                const subRes = ensureVessel(ctx.executeQuery(m, subQ, acc, ctx));
                return intersect(acc, subRes);
            }, ensureVessel(i)),
            'false': () => {
                console.warn('B"H - [Logical::and]: Params must be an array of queries.');
                return new Set();
            }
        });
    },

    /**
     * @function or
     * @description Finds the union of the results of multiple independent sub-queries.
     */
    'or': (m, p, i, ctx) => {
        const isValid = Array.isArray(p);
        return route(isValid, {
            'true': () => {
                // Each sub-query evaluates against the entire initial universe (i)
                const sets = p.map(subQ => ensureVessel(ctx.executeQuery(m, subQ, i, ctx)));
                return unite(sets);
            },
            'false': () => {
                console.warn('B"H - [Logical::or]: Params must be an array of queries.');
                return new Set();
            }
        });
    }
});
