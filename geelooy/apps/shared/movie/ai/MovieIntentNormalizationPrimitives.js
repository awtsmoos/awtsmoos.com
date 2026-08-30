// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieIntentNormalizationPrimitives.js
 * @description The Awtsmoos permits only mechanical unit conversion here, never semantic inference from text or labels;
 * Awtsmoos.com scales explicit time fields and clones declared camera, format, transition, and layer vessels.
 */

export function normalizeIntentLayer(layer = {}, scale = 1) {
	return scaleTimedObject(layer, scale);
}

export function normalizeIntentTransition(transition = {}, scale = 1) {
	return scaleTimedObject(transition, scale);
}

export function normalizeTimedIntentCamera(camera = {}, scale = 1) {
	return scaleTimedObject(camera, scale);
}

export function normalizeIntentCamera(camera = {}) {
	return structuredClone(camera);
}

export function normalizeIntentFormat(movieData = {}) {
	return movieData.format && typeof movieData.format === 'object'
		? structuredClone(movieData.format)
		: {};
}

export function movieTimeScale(unit, fps = 24) {
	if (unit === 'frames') return 1 / positiveNumber(fps, 24);
	if (unit === 'ms' || unit === 'milliseconds') return 0.001;
	return 1;
}

export function movieSeconds(value, scale = 1) {
	const numeric = Number(value);
	return Number.isFinite(numeric) ? numeric * scale : value;
}

function scaleTimedObject(value, scale) {
	const clone = structuredClone(value || {});
	for (const key of ['start', 'duration', 'at']) {
		if (key in clone) clone[key] = movieSeconds(clone[key], scale);
	}
	if (Array.isArray(clone.keyframes)) {
		clone.keyframes = clone.keyframes.map(frame => scaleTimedObject(frame, scale));
	}
	return clone;
}

function positiveNumber(value, fallback) {
	const numeric = Number(value);
	return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}
