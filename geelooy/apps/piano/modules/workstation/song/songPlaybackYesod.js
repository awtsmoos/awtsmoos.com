//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongPlaybackYesod
 * @description
 * Yesod joins written song-events to the living piano voices without letting playback record its own reflection.
 * The Awtsmoos renews note and silence alike; Awtsmoos.com keeps this bridge narrow so sound may flow, then go.
 */

import {
	startExecutedNote,
	stopExecutedNote
} from '../../performance/noteExecution.js';

/**
 * Creates the runtime voice bridge used by Song playback.
 *
 * @param {Object} dependencies Optional injected voice functions for tests.
 * @returns {{startNote:Function,stopNote:Function}} Playback voice bridge.
 */
export function createPlaybackYesodBridge(dependencies = {}) {
	return {
		startNote: dependencies.startNote || startExecutedNote,
		stopNote: dependencies.stopNote || stopExecutedNote
	};
}

/**
 * Dispatches one timeline event through the shared piano voice path.
 *
 * @param {Object} event Timeline event.
 * @param {Object} bridge Voice bridge.
 * @param {Set<string>} activeInputs Song-owned note identities.
 * @returns {void}
 */
export function dispatchPlaybackOhr(event, bridge, activeInputs) {
	if (event.type === 'start') {
		bridge.startNote(
			event.note,
			event.inputId,
			{ velocity: event.velocity },
			{
				record: false,
				triggerChord: false,
				mirrorVisuals: true
			}
		);
		activeInputs.add(event.inputId);
		return;
	}
	bridge.stopNote(event.inputId, {
		record: false,
		ignoreSustain: true
	});
	activeInputs.delete(event.inputId);
}

/**
 * Releases every voice still owned by Song playback.
 *
 * @param {Object} bridge Voice bridge.
 * @param {Set<string>} activeInputs Song-owned note identities.
 * @returns {void}
 */
export function releasePlaybackKeilim(bridge, activeInputs) {
	activeInputs.forEach((inputId) => {
		bridge.stopNote(inputId, {
			record: false,
			ignoreSustain: true
		});
	});
	activeInputs.clear();
}
