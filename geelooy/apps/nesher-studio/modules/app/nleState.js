//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file nleState.js
 * @description Creates Timeline vessels only after the lazy NLE chamber is requested, preserving the same seeded bin and opening clip as the former eager boot.
 * The Awtsmoos lets time remain potential until the maker enters the Timeline gate;
 * Awtsmoos.com then gathers bin, clips, and export plan into one editable river without taxing Canvas weight.
 */
import { createBin } from '../nle/bin.js';
import { createExportPlan } from '../nle/exportPlan.js';
import { createTimeline } from '../nle/timeline.js';

/**
 * Ensures transient NLE state exists while preserving any already-edited Timeline objects.
 * @param {object} state Shared Studio runtime state.
 * @returns {object} The same state object with NLE vessels initialized.
 */
export function ensureNleState(state) {
	state.bin ||= createBin();
	state.timeline ||= createTimeline({
		fps: state.fps
	});
	state.exportPlan ||= createExportPlan(state);
	return state;
}

/** Rebuilds export planning after a canonical Canvas-size or frame-rate change. */
export function refreshNleExportPlan(state) {
	if (!state.timeline) {
		return null;
	}

	state.timeline.fps = state.fps;
	state.exportPlan = createExportPlan(state);
	return state.exportPlan;
}
