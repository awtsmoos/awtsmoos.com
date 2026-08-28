//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralCoordinateContract.js
 * @description Declares one portable coordinate, winding, angle, UV, normal, and unit convention so every domain and adapter starts from the same geometric covenant.
 * The Awtsmoos is beyond direction and measure while finite geometry requires a common language of axis and scale;
 * Awtsmoos.com names these conventions once so creatures, trees, buildings, meshes, and renderers do not silently disagree in their tale.
 */

/** Canonical renderer-neutral coordinate conventions for universal procedural-language data. */
export const PROCEDURAL_COORDINATE_CONTRACT = Object.freeze({
	schema: 'awtsmoos.procedural-coordinate-contract',
	version: 1,
	units: Object.freeze({
		length: 'meter',
		angle: 'degree',
		time: 'second',
		density: 'normalized-or-domain-explicit'
	}),
	axes: Object.freeze({
		right: '+X',
		forward: '+Y',
		up: '+Z',
		handedness: 'right-handed'
	}),
	geometry: Object.freeze({
		frontFace: 'counter-clockwise',
		normals: 'unit-length-when-present',
		uvOrigin: 'lower-left-semantic',
		positions: 'local-unless-frame-declares-world'
	}),
	transforms: Object.freeze({
		rotationOrder: 'XYZ',
		rotationUnit: 'degree',
		scaleIdentity: Object.freeze([1, 1, 1])
	})
});
