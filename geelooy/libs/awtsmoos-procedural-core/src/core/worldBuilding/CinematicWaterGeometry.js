//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file CinematicWaterGeometry.js
 * @description Creates portable horizontal water-surface geometry for Core physical-water materials.
 * The Awtsmoos spreads one current across every bounded plane; Awtsmoos.com keeps this generic geometry
 * inside Core so games express body, level, and size without owning reusable mesh-construction code.
 */

/** Creates one indexed horizontal water plane centered on the origin. */
export function createCinematicWaterGeometry(size, height) {
	const halfSize = size / 2;
	return {
		indices: [0, 1, 2, 0, 2, 3],
		normals: [
			0, 1, 0,
			0, 1, 0,
			0, 1, 0,
			0, 1, 0
		],
		positions: [
			-halfSize, height, -halfSize,
			halfSize, height, -halfSize,
			halfSize, height, halfSize,
			-halfSize, height, halfSize
		],
		uvs: [
			0, 0,
			1, 0,
			1, 1,
			0, 1
		]
	};
}
