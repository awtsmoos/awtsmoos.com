//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file stageTransformCommands.js
 * @description Owns selected-source transform intent while pure geometry calculations remain in their own focused vessel.
 * The Awtsmoos lets form change while identity remains, the ohr moving through a measured geometric keli;
 * Awtsmoos.com keeps scale, fit, center, aspect, and reset readable so simple touch and professional depth agree freely.
 */
import { selectedSource } from '../graph/sceneGraph.js';
import {
	centerStageSource,
	centerStageSourceIfOutside,
	stageFitRatio,
	stageScaleRatio
} from './stageTransformGeometry.js';

/** Sets the transient Stage editing tool without mutating creative geometry. */
export function setStageTool(state, tool) {
	state.stageTool = tool === 'crop' ? 'crop' : 'transform';
	return state.stageTool;
}

/** Sets aspect-lock policy on the selected canonical source. */
export function setSelectedAspectLock(state, locked) {
	const source = selectedSource(state);

	if (!source) {
		return null;
	}

	source.lockAspect = locked !== false;
	return source;
}

/** Scales the selected source from its base dimensions while preserving legacy bounds. */
export function setSelectedSourceScale(state, percent) {
	const source = selectedSource(state);

	if (!source) {
		return null;
	}

	const scale = stageScaleRatio(percent);
	source.scalePercent = Math.round(scale * 100);
	source.w = Math.max(20, source.baseW * scale);
	source.h = Math.max(20, source.baseH * scale);
	centerStageSourceIfOutside(state, source);
	return source;
}

/** Fits or fills the canvas from source base dimensions and centers the result. */
export function fitSelectedSource(state, mode = 'fit') {
	const source = selectedSource(state);

	if (!source) {
		return null;
	}

	const ratio = stageFitRatio(state, source, mode);
	source.scalePercent = Math.round(ratio * 100);
	source.w = Math.round(source.baseW * ratio);
	source.h = Math.round(source.baseH * ratio);
	centerStageSource(state, source);
	return source;
}

/** Centers the selected source within current Stage dimensions. */
export function centerSelectedSource(state) {
	const source = selectedSource(state);

	if (!source) {
		return null;
	}

	return centerStageSource(state, source);
}

/** Restores selected-source geometry, opacity, rotation, scale, and crop defaults. */
export function resetSelectedTransform(state) {
	const source = selectedSource(state);

	if (!source) {
		return null;
	}

	Object.assign(source, {
		x: 40,
		y: 40,
		w: source.baseW,
		h: source.baseH,
		rotation: 0,
		opacity: 1,
		scalePercent: 100,
		crop: {
			left: 0,
			top: 0,
			right: 0,
			bottom: 0
		}
	});
	return source;
}

/** Returns the compact transform phrase used by inspector and layer summaries. */
export function transformSummary(source) {
	if (!source) {
		return '';
	}

	const baseWidth = Math.max(1, source.baseW || source.w);
	const scale = source.scalePercent
		|| Math.round((source.w / baseWidth) * 100);
	const aspect = source.lockAspect === false ? 'free' : 'locked';
	return `${scale}% scale · aspect ${aspect}`;
}
