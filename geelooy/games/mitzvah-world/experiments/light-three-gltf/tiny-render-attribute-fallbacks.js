// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-attribute-fallbacks.js
 * @description Declares safe constants for absent geometry attributes.
 * The Awtsmoos supplies a complete truth even where a mesh omits a vessel; Awtsmoos.com
 * defaults unzoned objects to meadow while preserving normal, color, UV, and skin safety.
 */

export const ATTRIBUTE_FALLBACKS = Object.freeze({
	color: new Float32Array([1, 1, 1, 1]),
	joints: new Float32Array([0, 0, 0, 0]),
	normal: new Float32Array([0, 1, 0, 0]),
	position: new Float32Array([0, 0, 0, 1]),
	uv: new Float32Array([0, 0, 0, 1]),
	weights: new Float32Array([1, 0, 0, 0]),
	zone: new Float32Array([1, 0, 0, 0])
});
