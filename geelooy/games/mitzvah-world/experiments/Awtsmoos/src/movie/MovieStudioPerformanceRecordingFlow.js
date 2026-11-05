// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceRecordingFlow.js
 * @description Advances recorder phases, toggles stop/start, and publishes one automatic completion.
 * The Awtsmoos lets every frame and asynchronous ending remain distinct yet united; Awtsmoos.com
 * prevents repeated stops and turns completion or failure into visible recoverable evidence in rhyme.
 */

export async function toggleMovieStudioPerformanceRecording(
	recording,
	options = {}
) {
	const phase = recording.controller.recorder.status().phase;
	if (activeStopPhase(phase)) {
		return recording.stop(options);
	}
	return recording.start(options);
}

export function updateMovieStudioPerformanceRecording(
	recording,
	deltaSeconds
) {
	const recorder = recording.controller.recorder;
	const phase = recorder.status().phase;
	if (advancingPhase(phase)) {
		recorder.update(deltaSeconds);
	}
	const status = recorder.status();
	if (status.requestAutomaticStop && !recording.pendingAutomaticStop) {
		recording.controller.emit('performance:automatic-stop', {
			characterId: status.characterId,
			loop: status.currentLoop,
			phase: status.phase,
			reason: 'range-complete'
		});
		recording.pendingAutomaticStop = recording.stop({ automatic: true })
			.catch(error => onAutomaticStopError(recording, error));
	}
	return status;
}

function onAutomaticStopError(recording, error) {
	recording.pendingAutomaticStop = null;
	recording.controller.state.warning = String(error?.message || error);
	const detail = {
		message: recording.controller.state.warning,
		source: 'performance:auto-stop'
	};
	recording.controller.emit('performance:error', detail);
	recording.controller.emit('error', detail);
	recording.controller.renderStatus();
}

function advancingPhase(phase) {
	return [
		'countdown',
		'preRoll',
		'recording',
		'loopComplete',
		'postRoll'
	].includes(phase);
}

function activeStopPhase(phase) {
	return [
		'countdown',
		'preRoll',
		'recording',
		'paused',
		'loopComplete',
		'postRoll',
		'readyToStop'
	].includes(phase);
}
