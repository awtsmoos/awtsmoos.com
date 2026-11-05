// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCompositionConstants.js
 * @description Declares bounded composition vocabulary shared by authoring, validation, and rendering.
 * The Awtsmoos contains every possible image without boundary; Awtsmoos.com gives each
 * finite composition measured layers, masks, blend vessels, and nesting shores that remain safe.
 */

export const MOVIE_COMPOSITION_SCHEMA_VERSION = 1;

export const MOVIE_COMPOSITION_LIMITS = Object.freeze({
	compositions: 128,
	layers: 256,
	masksPerLayer: 32,
	nestingDepth: 16,
	pointsPerMask: 128
});

export const MOVIE_COMPOSITION_BLEND_MODES = Object.freeze([
	'normal',
	'multiply',
	'screen',
	'overlay',
	'add',
	'subtract',
	'darken',
	'lighten'
]);

export const MOVIE_COMPOSITION_LAYER_KINDS = Object.freeze([
	'composition',
	'media',
	'track',
	'solid',
	'text'
]);

export const MOVIE_COMPOSITION_MASK_MODES = Object.freeze([
	'add',
	'subtract',
	'intersect'
]);
