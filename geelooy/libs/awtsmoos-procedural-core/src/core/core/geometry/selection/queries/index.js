
// B"H
/**
 * @file index.js
 * @brief The Master Registry of Query Handlers for Vertices.
 */

import { SPATIAL_QUERIES } from './spatial.js';
import { TOPOLOGICAL_QUERIES } from './topological.js';
import { LOGICAL_QUERIES } from './logical.js';
import { ORTHO_VIEWPORT_QUERY } from './orthoViewport.js';
import { ADVANCED_QUERIES } from './advanced.js';

export const QUERY_REGISTRY = {
    ...SPATIAL_QUERIES,
    ...TOPOLOGICAL_QUERIES,
    ...LOGICAL_QUERIES,
    ...ORTHO_VIEWPORT_QUERY,
    ...ADVANCED_QUERIES,
    
    /**
     * B"H - The Universal Gate. Selects every single spark in the vessel.
     */
    'all': (mesh, params, allVertices) => new Set(allVertices)
};
