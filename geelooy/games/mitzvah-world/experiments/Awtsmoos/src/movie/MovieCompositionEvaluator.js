// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCompositionEvaluator.js
 * @description Flattens nested composition layers into an immutable deterministic render plan.
 * The Awtsmoos is beyond inner and outer time; Awtsmoos.com carries each finite layer through
 * nested clocks, masks, transforms, blend vessels, and audio gates without losing its authored path.
 */

import { normalizeMovieCompositionCatalog } from './MovieCompositionContract.js';
import {
	createMovieCompositionEvaluationState,
	createMovieCompositionLeafPlan,
	positiveMovieCompositionModulo
} from './MovieCompositionEvaluationPlan.js';
import { combineMovieCompositionTransforms } from './MovieCompositionTransformContract.js';
import { MovieApiError } from './MovieApiError.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function evaluateMovieComposition(source, compositionId, time = 0) {
	const compositions = normalizeMovieCompositionCatalog(source);
	const byId = new Map(compositions.map(item => [item.id, item]));
	const root = requireComposition(byId, compositionId);
	const rootTime = finiteTime(time, root.duration);
	return createMovieProjectSnapshot({
		backgroundColor: root.backgroundColor,
		compositionId: root.id,
		duration: root.duration,
		fps: root.fps,
		height: root.height,
		layers: flattenComposition(
			root,
			rootTime,
			byId,
			createMovieCompositionEvaluationState()
		),
		pixelAspectRatio: root.pixelAspectRatio,
		time: rootTime,
		width: root.width
	});
}

function flattenComposition(composition, time, byId, state) {
	if (time < 0 || time >= composition.duration) return [];
	return composition.layers.flatMap((layer, index) => (
		flattenLayer(composition, layer, index, time, byId, state)
	));
}

function flattenLayer(composition, layer, index, time, byId, state) {
	if (!layer.enabled || time < layer.start || time >= layer.start + layer.duration) {
		return [];
	}
	const sourceTime = layer.sourceStart + ((time - layer.start) * layer.playbackRate);
	const transform = combineMovieCompositionTransforms(state.transform, {
		...layer.transform,
		opacity: layer.transform.opacity * layer.opacity
	});
	const nextState = {
		audioEnabled: state.audioEnabled && composition.audioEnabled && layer.audioEnabled,
		blendModes: [...state.blendModes, layer.blendMode],
		maskChain: layer.masks.length
			? [...state.maskChain, { layerId: layer.id, masks: layer.masks }]
			: state.maskChain,
		order: [...state.order, index],
		path: [...state.path, { compositionId: composition.id, layerId: layer.id }],
		transform
	};
	if (layer.kind !== 'composition') {
		return [createMovieCompositionLeafPlan(
			layer,
			composition.id,
			sourceTime,
			nextState
		)];
	}
	const nested = requireComposition(byId, layer.sourceId);
	const nestedTime = layer.loop
		? positiveMovieCompositionModulo(sourceTime, nested.duration)
		: sourceTime;
	return flattenComposition(nested, nestedTime, byId, nextState);
}

function requireComposition(byId, compositionId) {
	const item = byId.get(String(compositionId));
	if (item) return item;
	throw new MovieApiError(
		'MOVIE_COMPOSITION_NOT_FOUND',
		`Composition ${compositionId || '(empty)'} was not found.`
	);
}

function finiteTime(value, duration) {
	const number = Number(value);
	if (!Number.isFinite(number) || number < 0 || number > duration) {
		throw new MovieApiError(
			'INVALID_MOVIE_COMPOSITION_TIME',
			`Composition time must be between 0 and ${duration}.`
		);
	}
	return Number(number.toFixed(6));
}
