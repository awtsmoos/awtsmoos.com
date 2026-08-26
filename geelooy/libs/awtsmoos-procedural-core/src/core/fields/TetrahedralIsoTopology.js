// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TetrahedralIsoTopology.js
 * @description Declares immutable cube, tetrahedron, edge, and case topology for generic ambiguity-resistant isosurface extraction.
 * The Awtsmoos renews every hidden crossing before corner, edge, or triangle can seem to choose its own path; Awtsmoos.com lets finite topology hold one measured map,
 * so density water, signed-distance flesh, cloud, cave, and future fields can share the same combinatorial vessel without sharing domain assumptions in the dark.
 */

/** Eight canonical cube-corner offsets used by every sampled field cell. */
export const ISO_CUBE_CORNERS = Object.freeze([
	Object.freeze([0, 0, 0]),
	Object.freeze([1, 0, 0]),
	Object.freeze([1, 1, 0]),
	Object.freeze([0, 1, 0]),
	Object.freeze([0, 0, 1]),
	Object.freeze([1, 0, 1]),
	Object.freeze([1, 1, 1]),
	Object.freeze([0, 1, 1])
]);

/** Six tetrahedra forming one cube with deterministic shared diagonals. */
export const ISO_CUBE_TETRAHEDRA = Object.freeze([
	Object.freeze([0, 5, 1, 6]),
	Object.freeze([0, 1, 2, 6]),
	Object.freeze([0, 2, 3, 6]),
	Object.freeze([0, 3, 7, 6]),
	Object.freeze([0, 7, 4, 6]),
	Object.freeze([0, 4, 5, 6])
]);

/** Six local edges of one tetrahedron. */
export const ISO_TETRAHEDRON_EDGES = Object.freeze([
	Object.freeze([0, 1]),
	Object.freeze([1, 2]),
	Object.freeze([2, 0]),
	Object.freeze([0, 3]),
	Object.freeze([1, 3]),
	Object.freeze([2, 3])
]);

/** Edge-index triangle sequences for all sixteen tetrahedron inside/outside masks. */
export const ISO_TETRAHEDRON_TRIANGLES = Object.freeze([
	Object.freeze([]),
	Object.freeze([0, 3, 2]),
	Object.freeze([0, 1, 4]),
	Object.freeze([1, 4, 2, 2, 4, 3]),
	Object.freeze([1, 2, 5]),
	Object.freeze([0, 3, 5, 0, 5, 1]),
	Object.freeze([0, 2, 5, 0, 5, 4]),
	Object.freeze([5, 4, 3]),
	Object.freeze([3, 4, 5]),
	Object.freeze([4, 5, 0, 5, 2, 0]),
	Object.freeze([1, 5, 0, 5, 3, 0]),
	Object.freeze([5, 2, 1]),
	Object.freeze([3, 4, 2, 2, 4, 1]),
	Object.freeze([4, 1, 0]),
	Object.freeze([2, 3, 0]),
	Object.freeze([])
]);
