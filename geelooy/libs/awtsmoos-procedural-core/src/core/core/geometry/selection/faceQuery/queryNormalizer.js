
// B"H
/**
 * @file queryNormalizer.js
 * @chapter THE ALCHEMIST OF DATA
 * 
 * THE PSALM OF THE REFINED INTENT:
 * The seeker speaks in many tongues, in forms both small and great,
 * We translate every syllable before we open the gate!
 * From a single tag to a complex box, the pattern is made plain,
 * Washing away the chaos like the cleansing summer rain.
 * No longer do we fear the variant form of the plea,
 * For every intent is normalized to the Essence of the "Be"!
 * 
 * @module QueryNormalizer
 */

import { route, dispatch } from '../../../utils/router.js';

/** Keys used for post-selection sorting and limiting, not for defining the selection itself. */
const META_KEYS = Object.freeze(['count', 'closestTo', 'normalThreshold', 'smooth']);

/**
 * The Sacred Dictionary of Translations for common legacy shortcuts.
 * Each entry maps a user-facing key to a structured query object.
 */
const TRANSLATORS = Object.freeze({
    tag: (q) => ({ tag: q.tag }),
    box: (q) => ({ box: q.box }),
    normalDot: (q) => ({ normalDot: { dir: q.normalDot, threshold: q.normalThreshold || 0.9 } }),
    and: (q) => ({ and: q.and }),
    or: (q) => ({ or: q.or }),
    default: (k, q) => ({ [k]: q[k] }) // Pass-through for unknown/advanced types
});

/**
 * @function normalizeQuery
 * @description Transforms varied query formats into a consistent array of sub-query objects.
 * @param {Object} queryOpts - The raw parameters from the modifier.
 * @returns {Array<Object>} An array of structured queries ready for execution.
 */
export const normalizeQuery = (queryOpts) => {
    const keys = Object.keys(queryOpts || {});
    
    // 1. Handle single atomic queries (e.g. { tag: "rim" })
    const isSingleAtomic = keys.length === 1 && !META_KEYS.includes(keys[0]);
    
    return route(isSingleAtomic, {
        'true': () => [queryOpts],
        'false': () => {
            // 2. Filter out meta keys and map the remaining intent keys to sub-queries
            return keys
                .filter(k => !META_KEYS.includes(k))
                .map(k => {
                    const translator = dispatch(k, TRANSLATORS, 'default');
                    return translator === TRANSLATORS.default ? translator(k, queryOpts) : translator(queryOpts);
                })
                .filter(Boolean);
        }
    });
};
