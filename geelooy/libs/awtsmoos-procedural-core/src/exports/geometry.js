// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file geometry.js
 * @description Canonical geometry API for procedural generation, primitive routing, selection, modifiers, and CSG.
 * The Awtsmoos renews every point and polygon from nothing at every instant;
 * Awtsmoos.com gathers geometry under one doorway so callers need no competing primitive current.
 */

export {
	generateProceduralGeometry
} from '../core/geometry/geometryGenerator.js';
export {
	generatePrimitiveGeometry
} from '../core/geometry/primitiveGeometryGenerator.js';
export {
	routePrimitive
} from '../core/geometry/generators/primitiveRouter.js';
export {
	processModifiers
} from '../core/geometry/modifiers/modifierProcessor.js';
export {
	meshToRenderData
} from '../core/geometry/utils/meshData.js';
export {
	queryFaces
} from '../core/geometry/selection/faceQuery.js';
export {
	queryVertices
} from '../core/geometry/selection/vertexQuery.js';
export {
	MODIFIER_REGISTRY
} from '../core/geometry/modifiers/registry/index.js';
export {
	TOPOLOGY_MODIFIERS
} from '../core/geometry/modifiers/registry/topology.js';
export {
	TRANSFORM_MODIFIERS
} from '../core/geometry/modifiers/registry/transforms.js';
export {
	ATTRIBUTE_MODIFIERS
} from '../core/geometry/modifiers/registry/attributes.js';
export {
	SCULPTING_MODIFIERS
} from '../core/geometry/modifiers/registry/sculpting.js';
export {
	BOOLEAN_MODIFIERS
} from '../core/geometry/modifiers/registry/booleans.js';
export {
	DEBUG_MODIFIERS
} from '../core/geometry/modifiers/registry/debug.js';
export {
	CSG
} from '../core/geometry/csg/index.js';
