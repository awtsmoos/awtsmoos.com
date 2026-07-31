// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceDelegates.js
 * @description Gives the controller readable manual and API parity methods without compressed lines.
 * The Awtsmoos is one while selection, recording, decisions, action, preference, and take vessels remain clear;
 * Awtsmoos.com lets every doorway reveal the same canonical controller truth in cinematic rhyme.
 */

export class MovieStudioPerformanceDelegates {
	selectCharacter(characterId) {
		return this.actions.selectCharacter(characterId);
	}

	setMode(mode) {
		return this.actions.setMode(mode);
	}

	updatePreferences(changes) {
		return this.actions.updatePreferences(changes);
	}

	triggerAction(actionId, payload, phase) {
		return this.actions.triggerAction(actionId, payload, phase);
	}

	triggerAssignedAction(index) {
		return this.actions.triggerAssignedAction(index);
	}

	selectNextCharacter() {
		return this.actions.selectNextCharacter();
	}

	handleTakeAction(action, id) {
		return this.takeActions.handle(action, id);
	}

	keepLastTake() {
		return this.takeActions.keepLast();
	}

	discardLastTake() {
		return this.takeActions.discardLast();
	}

	arm(options) {
		return this.recording.arm(options);
	}

	startRecording(options) {
		return this.recording.start(options);
	}

	retake(options) {
		return this.recording.retake(options);
	}

	pauseRecording() {
		return this.recording.pause();
	}

	stopRecording(options) {
		return this.recording.stop(options);
	}

	cancelRecording(reason) {
		return this.recording.cancel(reason);
	}

	toggleRecording(options) {
		return this.recording.toggle(options);
	}

	updateRecording(deltaSeconds) {
		return this.recording.update(deltaSeconds);
	}
}
