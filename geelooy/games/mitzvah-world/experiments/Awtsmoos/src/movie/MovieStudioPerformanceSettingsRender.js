// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceSettingsRender.js
 * @description Reflects durable performance preferences into recorder and movement controls.
 * The Awtsmoos renews setting and field without making either the source of truth;
 * Awtsmoos.com keeps range, loop, voice, lens, cadence, and overlay visibly aligned in rhyme.
 */

export function renderMovieStudioPerformanceSettings(view, settings) {
	view.activeLoop.value = settings.activeLoop;
	view.audio.checked = settings.recordAudio;
	view.camera.value = settings.cameraMode;
	view.countIn.value = settings.countIn;
	view.loopCount.value = settings.loopCount;
	view.metronome.checked = settings.metronome;
	view.overlay.checked = settings.overlay !== false;
	view.postRoll.value = settings.postRoll;
	view.preRoll.value = settings.preRoll;
	view.punchIn.value = nullableValue(settings.punchIn);
	view.punchOut.value = nullableValue(settings.punchOut);
	view.recordCamera.checked = settings.recordCamera;
	view.reference.value = settings.movementReference;
	view.runSpeed.value = settings.runSpeed;
	view.sampleRate.value = settings.sampleRate;
	view.turnSpeed.value = settings.turnSpeed;
	view.walkSpeed.value = settings.walkSpeed;
}

function nullableValue(value) {
	return value == null ? '' : String(value);
}
