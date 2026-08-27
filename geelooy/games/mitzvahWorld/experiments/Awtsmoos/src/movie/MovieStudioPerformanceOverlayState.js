// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceOverlayState.js
 * @description Resolves path samples and recording guards without placing project logic in DOM handlers.
 * The Awtsmoos gives each finite point a truthful source and each active recording a guarded gate;
 * Awtsmoos.com keeps projected touch, canonical JSON, and runtime state from becoming one tangled fate.
 */

const EDIT_BLOCKING_PHASES = Object.freeze([
	'countdown',
	'preRoll',
	'recording',
	'paused',
	'postRoll'
]);

/**
 * Resolves one immutable project sample for the selected take path point.
 *
 * @param {object} controller Movie Studio performance controller.
 * @param {string} takeId Stable performance take identifier.
 * @param {number} index Transform sample index.
 * @returns {object} Existing transform sample.
 */
export function movieStudioPerformanceOverlaySample(controller, takeId, index) {
	const take = controller.session.project.performance.takes.find(item => (
		item.id === takeId
	));
	const sample = take?.transformSamples?.[index];
	if (!sample) {
		throw new Error(`PERFORMANCE_PATH_POINT_NOT_FOUND:${index}`);
	}
	return sample;
}

/**
 * Reports whether authored path mutation must be blocked by recorder lifecycle.
 *
 * @param {object} controller Movie Studio performance controller.
 * @returns {boolean} True while recording work owns the performer.
 */
export function movieStudioPerformanceOverlayRecordingActive(controller) {
	return EDIT_BLOCKING_PHASES.includes(controller.recorder.status().phase);
}
