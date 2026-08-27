
// B"H
/**
 * @file primitiveRouter.js
 * @brief The Seed of Form. Routes a string name to its physical manifestation function.
 */

import {
    createCubeMesh, createPlaneMesh, createGridMesh, createSphereMesh,
    createCylinderMesh, createTorusMesh, createIcosphereMesh, createTubeMesh,
    createExtrudedShapeMesh, createGrassFieldMesh, createUvSphereMesh
} from '../primitives.js';

/**
 * @brief Creates the raw base mesh before any modifiers are applied.
 * @param {string} primitive - The name of the shape (e.g., 'cube').
 * @param {object} params - The dimensions and properties of the shape.
 * @returns {object} A structured mesh object, or a flat renderData object for special types.
 */
export function routePrimitive(primitive, params) {
    if (primitive === 'none') return { faces: [] };
    if (primitive === 'grid') return createGridMesh(params);
    if (primitive === 'grass') return createGrassFieldMesh(params);

    if (primitive === 'cube') return createCubeMesh(params);
    if (primitive === 'plane') return createPlaneMesh(params);
    if (primitive === 'sphere') return createSphereMesh(params);
    if (primitive === 'cylinder') return createCylinderMesh(params);
    if (primitive === 'torus') return createTorusMesh(params);
    if (primitive === 'icosphere') return createIcosphereMesh(params);
    if (primitive === 'uvSphere') return createUvSphereMesh(params);
    if (primitive === 'tube') return createTubeMesh(params);
    if (primitive === 'extrudedShape') return createExtrudedShapeMesh(params);
    
    return createCubeMesh(params); // The default shape of reality
}
