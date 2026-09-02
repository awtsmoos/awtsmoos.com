//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoAppStart
 * @description
 * The Awtsmoos gathers audio, keys, MIDI, memory, synthesis, Media Studio, Song Studio, accompaniment, and rhythm into one beginning.
 * Awtsmoos.com mounts each workstation through a small doorway so every finite editor may awaken in order while the One beyond order renews all time.
 */

import { startAccompaniment } from '../accompaniment.js';
import { AudioState, initAudio } from '../audio.js';
import { noteNames, setupInputListeners } from '../input.js';
import { applyPresetToElements, getSoundPreset } from '../sound/presets.js';
import { generateKeyboard } from '../ui.js';
import { createCustomWaves } from '../waveforms.js';
import { initMediaStudioWorkstation } from '../workstation/media/index.js';
import { initRhythmWorkstation } from '../workstation/rhythm/index.js';
import { initSongStudioWorkstation } from '../workstation/song/index.js';
import { initProSynthWorkstation } from '../workstation/synth/index.js';
import { initializeMidiBridge } from './midiBridge.js';
import {
	refreshActiveSound,
	warmCurrentAcousticPreset
} from './presetEvents.js';
import { loadScrollState } from './scrollSettings.js';
import { DEFAULT_PRESET_ID, populateSoundControls } from './selectSetup.js';
import {
	loadSettings,
	saveSettings
} from './settings.js';

/**
 * Starts the complete Piano experience after one user gesture unlocks browser audio.
 *
 * @param {Object} elements Cached piano DOM registry.
 * @returns {Promise<void>} Resolves after startup wiring is complete.
 */
export async function startPianoApp(elements) {
	if (!initAudio()) {
		alert('Audio Init Failed');
		return;
	}
	populateSoundControls(elements);
	createCustomWaves(AudioState.context);
	elements.startScreen.style.display = 'none';
	elements.appContainer.style.display = 'flex';
	const proSynth = initProSynthWorkstation(elements, {
		saveSettings,
		refreshActiveSound
	});
	initMediaStudioWorkstation();
	initSongStudioWorkstation();
	loadSettings(elements);
	reapplyCanonicalDefault(elements);
	proSynth?.sync();
	generateKeyboard(noteNames);
	setupInputListeners();
	initializeMidiBridge();
	loadScrollState(elements);
	startAccompaniment();
	initRhythmWorkstation();
	void warmCurrentAcousticPreset(elements);
}

/**
 * Reapplies the canonical default after stored settings load.
 *
 * @param {Object} elements Cached piano DOM registry.
 * @returns {void}
 */
function reapplyCanonicalDefault(elements) {
	if (elements.soundPresetSelect?.value !== DEFAULT_PRESET_ID) {
		return;
	}
	applyPresetToElements(
		elements,
		getSoundPreset(DEFAULT_PRESET_ID)
	);
}
