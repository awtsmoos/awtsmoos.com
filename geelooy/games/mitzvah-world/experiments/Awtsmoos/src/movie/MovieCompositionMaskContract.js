// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCompositionMaskContract.js
 * @description Normalizes bounded polygon masks for reusable composition layers.
 * The Awtsmoos is beyond concealment and revelation; Awtsmoos.com gives each finite mask
 * named points, feather, mode, and opacity so compositing remains inspectable and deterministic.
 */

import {
	MOVIE_COMPOSITION_LIMITS,
	MOVIE_COMPOSITION_MASK_MODES
} from './MovieCompositionConstants.js';
import {
	assertUniqueMovieCompositionIds,
	movieCompositionError,
	normalizeMovieCompositionChoice,
	normalizeMovieCompositionId,
	normalizeMovieCompositionNumber
} from './MovieCompositionValues.js';

export function normalizeMovieCompositionMasks(source) {
	const masks = array(source).map((mask, index) => normalizeMask(mask, index));
	if (masks.length > MOVIE_COMPOSITION_LIMITS.masksPerLayer) {
		movieCompositionError(
			'TOO_MANY_MOVIE_COMPOSITION_MASKS',
			`A composition layer supports at most ${MOVIE_COMPOSITION_LIMITS.masksPerLayer} masks.`
		);
	}
	assertUniqueMovieCompositionIds(masks, 'composition mask id');
	return masks;
}

function normalizeMask(source, index) {
	const points = array(source?.points).map((point, pointIndex) => ({
		x: normalizeMovieCompositionNumber(
			point?.x, -100000, 100000, 0, `Mask point ${pointIndex + 1} x`
		),
		y: normalizeMovieCompositionNumber(
			point?.y, -100000, 100000, 0, `Mask point ${pointIndex + 1} y`
		)
	}));
	if (points.length < 3 || points.length > MOVIE_COMPOSITION_LIMITS.pointsPerMask) {
		movieCompositionError(
			'INVALID_MOVIE_COMPOSITION_MASK_POINTS',
			`A composition mask requires 3-${MOVIE_COMPOSITION_LIMITS.pointsPerMask} points.`
		);
	}
	return {
		feather: normalizeMovieCompositionNumber(
			source?.feather, 0, 10000, 0, 'Mask feather'
		),
		id: normalizeMovieCompositionId(source?.id || `mask-${index + 1}`, 'mask id'),
		inverted: Boolean(source?.inverted),
		mode: normalizeMovieCompositionChoice(
			source?.mode,
			MOVIE_COMPOSITION_MASK_MODES,
			'add',
			'mask mode'
		),
		name: String(source?.name || `Mask ${index + 1}`).slice(0, 160),
		opacity: normalizeMovieCompositionNumber(
			source?.opacity, 0, 1, 1, 'Mask opacity'
		),
		points
	};
}

function array(value) {
	return Array.isArray(value) ? value : [];
}
