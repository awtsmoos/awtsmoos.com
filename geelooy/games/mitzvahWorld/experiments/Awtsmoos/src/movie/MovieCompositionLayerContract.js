// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCompositionLayerContract.js
 * @description Normalizes timed, masked, transformed, reusable composition layers.
 * The Awtsmoos is beyond foreground and background; Awtsmoos.com orders finite vessels
 * with one source, one timing window, and transparent properties a renderer can faithfully reveal.
 */

import {
	MOVIE_COMPOSITION_BLEND_MODES,
	MOVIE_COMPOSITION_LAYER_KINDS
} from './MovieCompositionConstants.js';
import { normalizeMovieCompositionMasks } from './MovieCompositionMaskContract.js';
import { normalizeMovieCompositionTransform } from './MovieCompositionTransformContract.js';
import {
	movieCompositionError,
	normalizeMovieCompositionChoice,
	normalizeMovieCompositionColor,
	normalizeMovieCompositionId,
	normalizeMovieCompositionNumber
} from './MovieCompositionValues.js';

const REFERENCED_KINDS = new Set(['composition', 'media', 'track']);

export function normalizeMovieCompositionLayer(source, index, compositionDuration) {
	const kind = normalizeMovieCompositionChoice(
		source?.kind,
		MOVIE_COMPOSITION_LAYER_KINDS,
		'solid',
		'composition layer kind'
	);
	const sourceId = normalizeSourceId(source?.sourceId, kind);
	const start = number(source?.start, 0, compositionDuration, 0, 'Layer start');
	return {
		audioEnabled: source?.audioEnabled !== false,
		blendMode: normalizeMovieCompositionChoice(
			source?.blendMode,
			MOVIE_COMPOSITION_BLEND_MODES,
			'normal',
			'composition blend mode'
		),
		color: normalizeMovieCompositionColor(source?.color, '#ffffffff'),
		duration: number(
			source?.duration,
			0.001,
			Math.max(0.001, compositionDuration - start),
			Math.max(0.001, compositionDuration - start),
			'Layer duration'
		),
		enabled: source?.enabled !== false,
		id: normalizeMovieCompositionId(source?.id || `layer-${index + 1}`, 'layer id'),
		kind,
		locked: Boolean(source?.locked),
		loop: Boolean(source?.loop),
		masks: normalizeMovieCompositionMasks(source?.masks),
		name: String(source?.name || `Layer ${index + 1}`).slice(0, 160),
		opacity: number(source?.opacity, 0, 1, 1, 'Layer opacity'),
		playbackRate: number(source?.playbackRate, 0.01, 100, 1, 'Layer playback rate'),
		sourceId,
		sourceStart: number(source?.sourceStart, 0, 1000000, 0, 'Layer source start'),
		start,
		text: String(source?.text || '').slice(0, 100000),
		transform: normalizeMovieCompositionTransform(source?.transform)
	};
}

function normalizeSourceId(value, kind) {
	const sourceId = value == null ? null : String(value).trim();
	if (REFERENCED_KINDS.has(kind) && !sourceId) {
		movieCompositionError(
			'MOVIE_COMPOSITION_SOURCE_REQUIRED',
			`Composition layer kind ${kind} requires sourceId.`
		);
	}
	if (sourceId && sourceId.length > 256) {
		movieCompositionError(
			'INVALID_MOVIE_COMPOSITION_SOURCE',
			'Composition layer sourceId must not exceed 256 characters.'
		);
	}
	return sourceId;
}

function number(value, minimum, maximum, fallback, label) {
	return normalizeMovieCompositionNumber(value, minimum, maximum, fallback, label);
}
