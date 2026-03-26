
// B"H
/**
 * @file registry.js
 * @brief The Central Ledger of Face Selection Methods.
 */

import { FACE_QUERY_HANDLERS } from './handlers.js';

export const FACE_QUERY_REGISTRY = {
    // Foundation & Spatial
    'tag': FACE_QUERY_HANDLERS.tag,
    'box': FACE_QUERY_HANDLERS.box,
    'semanticSphere': FACE_QUERY_HANDLERS.semanticSphere,
    'semanticCylinder': FACE_QUERY_HANDLERS.semanticCylinder,
    'normalDot': FACE_QUERY_HANDLERS.normalDot,
    'closest': FACE_QUERY_HANDLERS.closest,
    'checker': FACE_QUERY_HANDLERS.checker,

    // Topology & Curvature
    'connected': FACE_QUERY_HANDLERS.connected,
    'coplanar': FACE_QUERY_HANDLERS.coplanar,
    'grow': FACE_QUERY_HANDLERS.grow,
    'shrink': FACE_QUERY_HANDLERS.shrink,
    'boundary': FACE_QUERY_HANDLERS.boundary,
    'geodesicWalk': FACE_QUERY_HANDLERS.geodesicWalk,
    'curvature': FACE_QUERY_HANDLERS.curvature,
    
    // Advanced Math
    'mathExpression': FACE_QUERY_HANDLERS.mathExpression,
    'noiseMask': FACE_QUERY_HANDLERS.noiseMask,

    // Viewport
    'screenBox': FACE_QUERY_HANDLERS.screenBox,

    // Logic
    'inverse': FACE_QUERY_HANDLERS.inverse,
    'and': FACE_QUERY_HANDLERS.and,
    'or': FACE_QUERY_HANDLERS.or,
    
    // Utilities
    'none': () => new Set(),
    'all': (mesh, params, allIndices) => allIndices,
};
