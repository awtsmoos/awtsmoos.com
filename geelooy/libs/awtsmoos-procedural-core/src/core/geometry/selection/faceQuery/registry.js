
// B"H
/**
 * @file registry.js
 * @chapter THE BOOK OF UNIVERSAL KNOWLEDGE
 * 
 * THE PSALM OF THE UNIFIED MAP:
 * All potential queries, from the simple to the grand,
 * Are recorded in this ledger by the Creator's hand.
 * No longer do we wander, seeking how to choose,
 * For every gate of selection is here, for the soul to use.
 * From the spatial box of limit to the logic of the "And",
 * This registry holds the keys to the entire geometric land!
 */

import { SPATIAL_QUERIES } from './queries/spatial.js';
import { LOGICAL_QUERIES } from './queries/logical.js';
import { TOPOLOGICAL_QUERIES } from './queries/topological.js';
import { MATHEMATICAL_QUERIES } from './queries/mathematical.js';
import { BIOLOGICAL_QUERIES } from './queries/biological.js';
import { SKELETAL_QUERIES } from './queries/skeletal.js';

/**
 * @constant FACE_QUERY_REGISTRY
 * @description A pure, frozen dictionary mapping query types to their specific handlers.
 */
export const FACE_QUERY_REGISTRY = Object.freeze({
    ...SPATIAL_QUERIES,
    ...LOGICAL_QUERIES,
    ...TOPOLOGICAL_QUERIES,
    ...MATHEMATICAL_QUERIES,
    ...BIOLOGICAL_QUERIES,
    ...SKELETAL_QUERIES,
    
    // --- FOUNDATIONAL DEFAULTS ---
    
    /**
     * Returns an empty set, representing the silence before speech.
     */
    'none': () => new Set(),
    
    /**
     * Returns the entire universe of potential indices.
     */
    'all': (_m, _p, i) => new Set(i)
});
