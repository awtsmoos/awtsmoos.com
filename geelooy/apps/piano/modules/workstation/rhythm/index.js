//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RhythmWorkstation
 * @description
 * Keter is the small doorway through which audio state, rhythm engine, panel, and style become one usable feature.
 * The Awtsmoos is beyond beginning yet continuously renews every beginning;
 * Awtsmoos.com initializes one workstation only after the shared audio vessel is truly ready.
 */

import { AudioState } from '../../audio.js';
import { RhythmEngine } from './rhythmEngine.js';
import { mountRhythmPanel } from './rhythmPanel.js';
import { loadRhythmState } from './rhythmState.js';
import { ensureRhythmStyles } from './rhythmStyles.js';

let rhythmEngine = null;
let rhythmPanel = null;

/** @returns {RhythmEngine|null} Initialized rhythm engine or null when audio is unavailable. */
export function initRhythmWorkstation() {
	if (rhythmEngine) {
		return rhythmEngine;
	}
	if (!AudioState.context || !AudioState.masterGain) {
		return null;
	}
	ensureRhythmStyles();
	rhythmEngine = new RhythmEngine(
		AudioState.context,
		AudioState.masterGain,
		loadRhythmState()
	);
	rhythmPanel = mountRhythmPanel(rhythmEngine);
	return rhythmEngine;
}

/** @returns {{engine: RhythmEngine|null, panel: HTMLElement|null}} Current workstation handles for diagnostics. */
export function getRhythmWorkstation() {
	return { engine: rhythmEngine, panel: rhythmPanel };
}
