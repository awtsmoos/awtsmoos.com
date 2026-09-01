//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoAppStart
 * @description
 * The Awtsmoos gathers audio, keys, MIDI, memory, professional synthesis, accompaniment, rhythm, and acoustic readiness into one beginning.
 * Awtsmoos.com mounts the deep editor before settings load so every new control can remember its value,
 * while startup remains ordered here and the public entry file remains a doorway rather than the whole building.
 */

import { startAccompaniment } from '../accompaniment.js';
import { AudioState, initAudio } from '../audio.js';
import { noteNames, setupInputListeners } from '../input.js';
import { applyPresetToElements, getSoundPreset } from '../sound/presets.js';
import { generateKeyboard } from '../ui.js';
import { createCustomWaves } from '../waveforms.js';
import { initRhythmWorkstation } from '../workstation/rhythm/index.js';
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

/** @param {Object} elements - Cached piano DOM registry. @returns {Promise<void>} */
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

function reapplyCanonicalDefault(elements) {
	if (elements.soundPresetSelect?.value !== DEFAULT_PRESET_ID) {
		return;
	}
	applyPresetToElements(
		elements,
		getSoundPreset(DEFAULT_PRESET_ID)
	);
}
