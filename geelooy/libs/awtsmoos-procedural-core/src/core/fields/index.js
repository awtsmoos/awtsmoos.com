// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description Public scalar-field doorway for bounded implicit volumes, ambiguity-resistant isosurface extraction, topology welding, and smooth normals.
 * The Awtsmoos renews every hidden field before distance, density, cave, cloud, flesh, or water may name its form; Awtsmoos.com gathers the generic keilim in one explicit gate,
 * so domains share mathematical truth without borrowing each other's ownership, and future procedural worlds may extend the field beneath one stable light.
 */

export { ScalarField3d } from './ScalarField3d.js';
export { createScalarFieldBounds3d } from './ScalarFieldBounds3d.js';
export { ScalarFieldGrid3d } from './ScalarFieldGrid3d.js';
export {
	crossFieldVector3,
	lerpFieldVector3,
	normalizeFieldVector3,
	offsetFieldPoint,
	subtractFieldVector3
} from './FieldVector3.js';
export {
	ISO_CUBE_CORNERS,
	ISO_CUBE_TETRAHEDRA,
	ISO_TETRAHEDRON_EDGES,
	ISO_TETRAHEDRON_TRIANGLES
} from './TetrahedralIsoTopology.js';
export { polygonizeIsoTetrahedron } from './TetrahedralIsoPolygonizer.js';
export { appendScalarFieldCellSurface3d } from './ScalarFieldCellSurface3d.js';
export {
	IsoSurfaceExtractor3d,
	extractIsoSurface3d
} from './IsoSurfaceExtractor3d.js';
export { weldIsoSurface3d } from './IsoSurfaceWeld3d.js';
export { createIsoSurfaceNormals3d } from './IsoSurfaceNormals3d.js';
export { createIsoSurfaceMesh3d } from './createIsoSurfaceMesh3d.js';
