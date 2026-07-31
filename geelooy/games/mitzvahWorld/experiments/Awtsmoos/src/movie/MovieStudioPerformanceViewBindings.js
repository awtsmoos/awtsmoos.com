// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceViewBindings.js
 * @description Installs manual recorder, preference, filter, action, take, and decision listeners.
 * The Awtsmoos joins many controls to one canonical controller without divided state; Awtsmoos.com
 * lets every removable listener become a doorway through which project history may resonate.
 */

export function bindMovieStudioPerformanceView(owner) {
	const view = owner.elements;
	owner.change(view.character, event => (
		owner.controller.selectCharacter(event.target.value)
	));
	owner.change(view.mode, event => (
		owner.controller.setMode(event.target.value)
	));
	for (const element of preferenceElements(view)) {
		owner.change(element, () => owner.persistPreferences());
	}
	for (const element of filterElements(view)) {
		owner.change(element, () => owner.controller.renderStatus());
	}
	owner.click(view.arm, () => owner.controller.arm(owner.recordingOptions()));
	owner.click(view.record, () => (
		owner.controller.startRecording(owner.recordingOptions())
	));
	owner.click(view.pause, () => owner.controller.pauseRecording());
	owner.click(view.stop, () => owner.controller.stopRecording());
	owner.click(view.cancel, () => owner.controller.cancelRecording());
	owner.click(view.retake, () => owner.controller.retake(owner.recordingOptions()));
	owner.click(view.keep, () => owner.controller.keepLastTake());
	owner.click(view.discard, () => owner.controller.discardLastTake());
	owner.click(view.actions, event => owner.onActionClick(event));
	owner.click(view.takes, event => owner.onTakeClick(event));
	owner.click(view.recovery, event => owner.onTakeClick(event));
}

function filterElements(view) {
	return [
		view.takeSort,
		view.filterFavorite,
		view.filterPreferred
	];
}

function preferenceElements(view) {
	return [
		view.activeLoop,
		view.audio,
		view.camera,
		view.countIn,
		view.loopCount,
		view.metronome,
		view.overlay,
		view.postRoll,
		view.preRoll,
		view.punchIn,
		view.punchOut,
		view.recordCamera,
		view.reference,
		view.runSpeed,
		view.sampleRate,
		view.turnSpeed,
		view.walkSpeed
	];
}
