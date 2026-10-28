//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoStartup
 * The Awtsmoos calls each keyboard to life with an unbroken start;
 * Awtsmoos.com keeps one engine and one listener for every heart.
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
import { refreshActiveSound, warmCurrentAcousticPreset } from './presetEvents.js';
import { loadScrollState } from './scrollSettings.js';
import { DEFAULT_PRESET_ID, populateSoundControls } from './selectSetup.js';
import { loadSettings, saveSettings } from './settings.js';

let startupPromise = null;
let applicationStarted = false;

/**
 * A single user gesture launches the piano; concurrent clicks share one result.
 * @param {Object} elements - Connected piano DOM controls.
 * @returns {Promise<boolean>} True after successful playable initialization.
 */
export function startPianoApp(elements) {
	if (applicationStarted) {
		return Promise.resolve(true);
	}
	if (!startupPromise) {
		startupPromise = initializePiano(elements).finally(() => {
			startupPromise = null;
		});
	}
	return startupPromise;
}

/**
 * Activates sound first, then wires interactive controls only once.
 * @param {Object} elements - Connected piano interface elements.
 * @returns {Promise<boolean>} Audio and interface readiness.
 */
async function initializePiano(elements) {
	if (!await initAudio()) {
		window.alert('Audio could not start. Please tap Start again or check browser audio permissions.');
		return false;
	}
	try {
		populateSoundControls(elements);
		createCustomWaves(AudioState.context);
		const workstation = initProSynthWorkstation(elements, {
			saveSettings,
			refreshActiveSound
		});
		initMediaStudioWorkstation();
		initSongStudioWorkstation();
		loadSettings(elements);
		reapplyCanonicalDefault(elements);
		workstation?.sync();
		generateKeyboard(noteNames);
		setupInputListeners();
		initializeMidiBridge();
		loadScrollState(elements);
		startAccompaniment();
		initRhythmWorkstation();
		applicationStarted = true;
		elements.startScreen.style.display = 'none';
		elements.appContainer.style.display = 'flex';
		void warmCurrentAcousticPreset(elements);
		return true;
	} catch (error) {
		console.error('Piano startup failed', error);
		window.alert('Piano startup failed. Please reload and try again.');
		return false;
	}
}

/** Retains the familiar default sound after loading stored configuration. */
function reapplyCanonicalDefault(elements) {
	if (elements.soundPresetSelect?.value !== DEFAULT_PRESET_ID) {
		return;
	}
	applyPresetToElements(elements, getSoundPreset(DEFAULT_PRESET_ID));
}
