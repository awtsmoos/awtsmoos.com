// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformancePreferenceValues.js
 * @description Normalizes acting pace, recorder ranges, loop selection, camera settings, and action assignments.
 * The Awtsmoos gives each finite preference its proper boundary; Awtsmoos.com keeps actor,
 * lens, voice, count, punch, loop, overlay, and numbered deeds durable in one project rhyme.
 */

export function moviePerformancePreferenceValues(source = {}) {
	const punch = normalizePunch(source.punchIn, source.punchOut);
	return {
		actionAssignments: normalizeAssignments(source.actionAssignments),
		activeLoop: integer(source.activeLoop, 1, 1, 100),
		camera: normalizeCamera(source.camera),
		cameraMode: enumValue(
			source.cameraMode,
			['director', 'follow', 'firstPerson', 'freeDirector', 'recorded'],
			'director'
		),
		countIn: finite(source.countIn, 3, 0, 10),
		jumpEnabled: source.jumpEnabled !== false,
		loopCount: integer(source.loopCount, 1, 1, 100),
		metronome: Boolean(source.metronome),
		movementReference: enumValue(
			source.movementReference,
			['character', 'camera'],
			'camera'
		),
		overlay: source.overlay !== false,
		postRoll: finite(source.postRoll, 0, 0, 30),
		preRoll: finite(source.preRoll, 0, 0, 30),
		punchIn: punch.inPoint,
		punchOut: punch.outPoint,
		recordAudio: Boolean(source.recordAudio),
		recordCamera: Boolean(source.recordCamera),
		runSpeed: finite(source.runSpeed, 7.2, 0.1, 30),
		sampleRate: sampleRate(source.sampleRate),
		turnSpeed: finite(source.turnSpeed, 2.35, 0.1, 10),
		walkSpeed: finite(source.walkSpeed, 4.2, 0.1, 20)
	};
}

function normalizeAssignments(source) {
	const values = Array.isArray(source) ? source : [];
	return Array.from({ length: 9 }, (unused, index) => {
		const value = values[index];
		return value == null || value === '' ? null : String(value).slice(0, 500);
	});
}

function normalizeCamera(source = {}) {
	return {
		collisionAvoidance: Boolean(source.collisionAvoidance),
		damping: finite(source.damping, 0.14, 0, 1),
		distance: finite(source.distance, 6.5, 1, 30),
		eyeOffset: finite(source.eyeOffset, 0, -2, 2),
		height: finite(source.height, 2.2, 0, 12),
		invertY: Boolean(source.invertY),
		lookSensitivity: finite(source.lookSensitivity, 0.003, 0.0001, 0.05),
		shoulderOffset: finite(source.shoulderOffset, 0.7, -5, 5)
	};
}

function normalizePunch(inValue, outValue) {
	const inPoint = optionalFinite(inValue, 0, 86400);
	const outPoint = optionalFinite(outValue, 0, 86400);
	return {
		inPoint,
		outPoint: outPoint != null
			&& (inPoint == null || outPoint > inPoint)
			? outPoint
			: null
	};
}

function sampleRate(value) {
	const number = Number(value);
	return [24, 30, 60].includes(number) ? number : 30;
}

function enumValue(value, options, fallback) {
	return options.includes(value) ? value : fallback;
}

function integer(value, fallback, minimum, maximum) {
	return Math.round(finite(value, fallback, minimum, maximum));
}

function optionalFinite(value, minimum, maximum) {
	if (value == null || value === '') {
		return null;
	}
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, number))
		: null;
}

function finite(value, fallback, minimum, maximum) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, number))
		: fallback;
}
