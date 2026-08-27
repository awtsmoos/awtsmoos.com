// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceViewOptions.js
 * @description Reads bounded movement, recorder range, loop, microphone, camera, and take choices.
 * The Awtsmoos joins finite fields to truthful intention without making DOM into project state;
 * Awtsmoos.com keeps pace, punch, roll, cadence, voice, lens, and loop selection bounded in rhyme.
 */

export function readMovieStudioPerformanceRecordingOptions(view) {
	return {
		cameraMode: view.camera.value,
		countIn: bounded(view.countIn.value, 0, 10, 0),
		inPoint: optional(view.punchIn.value),
		loopCount: integer(view.loopCount.value, 1, 100, 1),
		metronome: view.metronome.checked,
		movementReference: view.reference.value,
		name: view.takeName.value,
		outPoint: optional(view.punchOut.value),
		postRoll: bounded(view.postRoll.value, 0, 30, 0),
		preRoll: bounded(view.preRoll.value, 0, 30, 0),
		recordAudio: view.audio.checked,
		recordCamera: view.recordCamera.checked,
		sampleRate: sampleRate(view.sampleRate.value)
	};
}

export function readMovieStudioPerformanceSettings(view, preferences = {}) {
	return {
		...preferences,
		camera: { ...(preferences.camera || {}) },
		...readMovieStudioPerformancePreferenceChanges(view)
	};
}

export function readMovieStudioPerformancePreferenceChanges(view) {
	return {
		activeLoop: integer(view.activeLoop.value, 1, 100, 1),
		cameraMode: view.camera.value,
		countIn: bounded(view.countIn.value, 0, 10, 3),
		loopCount: integer(view.loopCount.value, 1, 100, 1),
		metronome: view.metronome.checked,
		movementReference: view.reference.value,
		overlay: view.overlay.checked,
		postRoll: bounded(view.postRoll.value, 0, 30, 0),
		preRoll: bounded(view.preRoll.value, 0, 30, 0),
		punchIn: optional(view.punchIn.value),
		punchOut: optional(view.punchOut.value),
		recordAudio: view.audio.checked,
		recordCamera: view.recordCamera.checked,
		runSpeed: bounded(view.runSpeed.value, 0.1, 30, 7.2),
		sampleRate: sampleRate(view.sampleRate.value),
		turnSpeed: bounded(view.turnSpeed.value, 0.1, 10, 2.35),
		walkSpeed: bounded(view.walkSpeed.value, 0.1, 20, 4.2)
	};
}

function sampleRate(value) {
	const number = Number(value);
	return [24, 30, 60].includes(number) ? number : 30;
}

function optional(value) {
	if (value == null || value === '') {
		return null;
	}
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, number) : null;
}

function integer(value, minimum, maximum, fallback) {
	return Math.round(bounded(value, minimum, maximum, fallback));
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, number))
		: fallback;
}
