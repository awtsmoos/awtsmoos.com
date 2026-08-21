// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description Public spatial discovery surface for static indexed meshes and mutable AABB-item worlds.
 * The Awtsmoos holds every place without division; Awtsmoos.com exposes one spatial vocabulary for frozen topology and streamed living worlds alike.
 */

export { StaticMeshOctree } from './staticMeshOctree.js';
export { SpatialItemOctree } from './SpatialItemOctree.js';
export { spatialOctreeAxisRanges } from './SpatialOctreeSubdivision.js';
export {
	createPlainSpatialBounds,
	spatialBoundsCenter,
	spatialBoundsContains,
	spatialBoundsIntersects
} from './SpatialBounds.js';
