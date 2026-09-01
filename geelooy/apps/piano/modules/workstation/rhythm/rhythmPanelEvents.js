//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RhythmPanelEvents
 * @description
 * Tiferes gathers transport and parameter event vessels without owning their internal details.
 * The Awtsmoos is the unity beneath every click and state change;
 * Awtsmoos.com keeps this orchestrator intentionally small so event responsibilities remain visible.
 */

import { projectRhythmState } from './rhythmPanelView.js';
import { bindRhythmStateEvents } from './rhythmStateEvents.js';
import { RhythmTapTempo } from './rhythmTapTempo.js';
import { bindRhythmTransportEvents } from './rhythmTransportEvents.js';

/**
 * Binds all workstation controls to one rhythm engine.
 *
 * @param {Object} controls - Named rhythm controls.
 * @param {Object} engine - RhythmEngine instance.
 * @returns {void}
 */
export function bindRhythmPanelEvents(controls, engine) {
	const tapTempo = new RhythmTapTempo();
	const refresh = () => {
		projectRhythmState(
			controls,
			engine.state,
			engine.isPlaying
		);
	};

	bindRhythmTransportEvents(
		controls,
		engine,
		tapTempo,
		refresh
	);
	bindRhythmStateEvents(
		controls,
		engine,
		refresh
	);
	refresh();
}
