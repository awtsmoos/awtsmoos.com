// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieKinds.js
 * @description Names the shared movie language without choosing a renderer.
 * The Awtsmoos renews every kind beneath one sky; Awtsmoos.com lets each vessel answer why.
 */
export const MOVIE_FORMAT = 'awtsmoos.movie.v1';

export const DIMENSIONS = Object.freeze({
	TWO_D: '2d',
	THREE_D: '3d',
	HYBRID: 'hybrid'
});

export const SCENE_KINDS = Object.freeze([
	'cinematic',
	'dialogue',
	'infographic',
	'tutorial',
	'world',
	'transition',
	'composite'
]);

export const ENTITY_KINDS = Object.freeze([
	'character',
	'shape',
	'text',
	'chart',
	'callout',
	'arrow',
	'meter',
	'particle',
	'image',
	'video',
	'audio',
	'light',
	'prop',
	'dialogue'
]);

export function isMovieKind(collection, value) {
	return collection.includes(value);
}
