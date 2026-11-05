// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCompositionContract.js
 * @description Normalizes reusable compositions and validates their complete nesting graph.
 * The Awtsmoos is beyond frame, duration, and hierarchy; Awtsmoos.com gives finite films
 * reusable canvases whose layers, work areas, cadence, and references remain canonical in every host.
 */

import {
	MOVIE_COMPOSITION_LIMITS,
	MOVIE_COMPOSITION_SCHEMA_VERSION
} from './MovieCompositionConstants.js';
import { validateMovieCompositionGraph } from './MovieCompositionGraph.js';
import { normalizeMovieCompositionLayer } from './MovieCompositionLayerContract.js';
import {
	assertUniqueMovieCompositionIds,
	movieCompositionError,
	normalizeMovieCompositionColor,
	normalizeMovieCompositionId,
	normalizeMovieCompositionNumber
} from './MovieCompositionValues.js';

export function normalizeMovieCompositionCatalog(source) {
	const compositions = array(source).map((item, index) => (
		normalizeMovieComposition(item, index)
	));
	if (compositions.length > MOVIE_COMPOSITION_LIMITS.compositions) {
		movieCompositionError(
			'TOO_MANY_MOVIE_COMPOSITIONS',
			`A project supports at most ${MOVIE_COMPOSITION_LIMITS.compositions} compositions.`
		);
	}
	assertUniqueMovieCompositionIds(compositions, 'composition id');
	validateMovieCompositionGraph(compositions);
	return compositions;
}

export function normalizeMovieComposition(source = {}, index = 0) {
	const duration = number(source.duration, 0.001, 86400, 10, 'Composition duration');
	const layers = array(source.layers).map((layer, layerIndex) => (
		normalizeMovieCompositionLayer(layer, layerIndex, duration)
	));
	if (layers.length > MOVIE_COMPOSITION_LIMITS.layers) {
		movieCompositionError(
			'TOO_MANY_MOVIE_COMPOSITION_LAYERS',
			`A composition supports at most ${MOVIE_COMPOSITION_LIMITS.layers} layers.`
		);
	}
	assertUniqueMovieCompositionIds(layers, 'composition layer id');
	return {
		audioEnabled: source.audioEnabled !== false,
		backgroundColor: normalizeMovieCompositionColor(
			source.backgroundColor,
			'#00000000'
		),
		duration,
		fps: number(source.fps, 1, 240, 30, 'Composition fps'),
		height: number(source.height, 1, 16384, 1080, 'Composition height'),
		id: normalizeMovieCompositionId(
			source.id || `composition-${index + 1}`,
			'composition id'
		),
		layers,
		name: String(source.name || `Composition ${index + 1}`).slice(0, 200),
		pixelAspectRatio: number(
			source.pixelAspectRatio,
			0.1,
			10,
			1,
			'Composition pixel aspect ratio'
		),
		version: MOVIE_COMPOSITION_SCHEMA_VERSION,
		width: number(source.width, 1, 16384, 1920, 'Composition width'),
		workArea: normalizeWorkArea(source.workArea, duration)
	};
}

function normalizeWorkArea(source = {}, duration) {
	const start = number(source?.start, 0, duration, 0, 'Composition work area start');
	return {
		end: number(source?.end, start, duration, duration, 'Composition work area end'),
		start
	};
}

function number(value, minimum, maximum, fallback, label) {
	return normalizeMovieCompositionNumber(value, minimum, maximum, fallback, label);
}

function array(value) {
	return Array.isArray(value) ? value : [];
}
