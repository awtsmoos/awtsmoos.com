
// B"H
/**
 * @file csgPrimitiveFactory.js
 * @chapter THE SUMMONING OF THE BLADE
 * 
 * THE TRACTATE OF THE SUDDEN FORM:
 * We need not pull a cutter from the memory's deep,
 * We forge it in the moment, waking it from sleep!
 * A dictionary maps the name to the sacred cast,
 * Creating shapes of light that are destined to last!
 * 
 * @module CSGPrimitiveFactory
 */

import { createCubeMesh } from '../../primitives/cube.js';
import { createCylinderMesh } from '../../primitives/cylinder.js';
import { createSphereMesh } from '../../primitives/sphere.js';

const PRIMITIVE_MAP = Object.freeze({
    'cube': createCubeMesh,
    'cylinder': createCylinderMesh,
    'sphere': createSphereMesh,
    'default': createCubeMesh
});

/**
 * @brief Summons a primitive mesh geometry based on a string mapping.
 */
export const generateCutterPrimitive = (type, parameters) => {
    const generator = PRIMITIVE_MAP[type] || PRIMITIVE_MAP['default'];
    return generator(parameters || { size: 1.0 });
};
