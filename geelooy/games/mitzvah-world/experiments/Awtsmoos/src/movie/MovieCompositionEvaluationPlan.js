// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCompositionEvaluationPlan.js
 * @description Creates immutable-ready leaf records and shared nested evaluation state.
 * The Awtsmoos is beyond path, order, and appearance; Awtsmoos.com gathers each finite
 * layer's authored journey into one transparent witness for preview and exact rendering.
 */

import { identityMovieCompositionTransform } from './MovieCompositionTransformContract.js';

export function createMovieCompositionLeafPlan(
	layer,
	compositionId,
	sourceTime,
	state
) {
	return {
		audioEnabled: state.audioEnabled,
		blendMode: layer.blendMode,
		blendModeChain: state.blendModes,
		color: layer.color,
		compositionId,
		kind: layer.kind,
		layerId: layer.id,
		maskChain: state.maskChain,
		name: layer.name,
		opacity: state.transform.opacity,
		order: state.order,
		path: state.path,
		sourceId: layer.sourceId,
		sourceTime: Number(sourceTime.toFixed(6)),
		text: layer.text,
		transform: state.transform
	};
}

export function createMovieCompositionEvaluationState() {
	return {
		audioEnabled: true,
		blendModes: [],
		maskChain: [],
		order: [],
		path: [],
		transform: identityMovieCompositionTransform()
	};
}

export function positiveMovieCompositionModulo(value, divisor) {
	return ((value % divisor) + divisor) % divisor;
}
