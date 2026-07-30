// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformanceRecorderOptions.js
 * @description Normalizes count-in, punch, loop, pre-roll, post-roll, audio, camera, and cadence.
 * The Awtsmoos gives every performance boundary its measured vessel; Awtsmoos.com
 * keeps director intention bounded before recording begins so each take may enter time in rhyme.
 */

export function normalizeMoviePerformanceRecorderOptions(options = {}, target) {
	const inPoint = nonnegative(options.inPoint ?? options.start);
	const outPoint = optionalNumber(options.outPoint);
	if (outPoint != null && outPoint <= inPoint) {
		throw new Error('PERFORMANCE_PUNCH_RANGE_INVALID');
	}
	return {
		cameraMode: enumValue(
			options.cameraMode,
			['director', 'follow', 'firstPerson', 'freeDirector', 'recorded'],
			'director'
		),
		countIn: bounded(options.countIn, 0, 10, 0),
		inPoint,
		loopCount: bounded(options.loopCount, 1, 100, 1),
		metronome: Boolean(options.metronome),
		movementReference: options.movementReference === 'character'
			? 'character'
			: 'camera',
		name: String(options.name || `${target.name} Take`).slice(0, 500),
		outPoint,
		postRoll: bounded(options.postRoll, 0, 30, 0),
		preRoll: bounded(options.preRoll, 0, 30, 0),
		recordActions: options.recordActions !== false,
		recordAudio: Boolean(options.recordAudio),
		recordCamera: Boolean(options.recordCamera),
		sampleRate: [24, 30, 60].includes(Number(options.sampleRate))
			? Number(options.sampleRate)
			: 30
	};
}

function optionalNumber(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, number) : null;
}

function nonnegative(value) {
	return Math.max(0, Number(value) || 0);
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		return fallback;
	}
	return Math.max(minimum, Math.min(maximum, number));
}

function enumValue(value, values, fallback) {
	return values.includes(value) ? value : fallback;
}
