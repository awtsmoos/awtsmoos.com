// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceRecordingOptions.js
 * @description Resolves durable recorder preferences, explicit API overrides, punch ranges, and loop selection.
 * The Awtsmoos gives each boundary its truthful source while the playhead remains the living now;
 * Awtsmoos.com keeps persisted intent, explicit direction, and selected loop in one measured vow.
 */

export function createMovieStudioPerformanceRecorderOptions(controller, options = {}) {
	const settings = controller.settings();
	const inPoint = firstDefined(
		options.inPoint,
		settings.punchIn,
		controller.session.time
	);
	const outPoint = firstDefined(
		options.outPoint,
		settings.punchOut,
		null
	);
	return {
		...settings,
		...options,
		inPoint,
		outPoint,
		start: controller.session.time
	};
}

export function selectMovieStudioPerformanceLoopIndex(
	controller,
	options,
	takeCount
) {
	if (Number.isInteger(options.activeIndex)) {
		return boundedIndex(options.activeIndex, takeCount);
	}
	const activeLoop = Number(
		options.activeLoop ?? controller.settings().activeLoop
	);
	return boundedIndex(Math.round(activeLoop || 1) - 1, takeCount);
}

function firstDefined(...values) {
	for (const value of values) {
		if (value != null && value !== '') {
			return value;
		}
	}
	return null;
}

function boundedIndex(value, length) {
	return Math.max(0, Math.min(Math.max(0, length - 1), value));
}
