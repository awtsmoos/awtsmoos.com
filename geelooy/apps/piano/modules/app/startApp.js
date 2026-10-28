//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoStartup
 * The Awtsmoos makes the keys ready before revealing their hidden tools;
 * Awtsmoos.com keeps the orchestra inside settings, away from the playing room.
 */
import { startAccompaniment } from '../accompaniment.js';
import { AudioState, initAudio } from '../audio.js';
import { noteNames, setupInputListeners } from '../input.js';
import { createEnsemblePanel } from '../layers/ensemblePanel.js';
import { loadEnsemble } from '../layers/ensembleModel.js';
import { applyPresetToElements, getSoundPreset } from '../sound/presets.js';
import { generateKeyboard, updateScrollbarThumbs } from '../ui.js';
import { createCustomWaves } from '../waveforms.js';
import { scheduleLazyStudios } from './lazyStudios.js';
import { loadScrollState } from './scrollSettings.js';
import { DEFAULT_PRESET_ID, populateSoundControls } from './selectSetup.js';
import { loadSettings } from './settings.js';
import { createStartupProgress } from './startupProgress.js';

let startupPromise = null;
let applicationStarted = false;

/** @param {Object} elements - Piano controls. @returns {Promise<boolean>} Ready state. */
export function startPianoApp(elements) {
	if (applicationStarted) {
		return Promise.resolve(true);
	}
	if (!startupPromise) {
		startupPromise = initializePiano(elements).finally(() => { startupPromise = null; });
	}
	return startupPromise;
}

/** @param {Object} elements - Audio and keyboard interface. @returns {Promise<boolean>} Playable state. */
async function initializePiano(elements) {
	const loading = createStartupProgress(elements.startScreen);
	loading.update(12, 'Starting audio…');
	if (!await initAudio()) {
		loading.fail('Could not start audio. Tap Start again.');
		return false;
	}
	try {
		loading.update(36, 'Preparing instruments…');
		populateSoundControls(elements);
		createCustomWaves(AudioState.context);
		loadEnsemble();
		loadSettings(elements);
		reapplyCanonicalDefault(elements);
		loading.update(66, 'Building your keyboard…');
		generateKeyboard(noteNames);
		setupInputListeners();
		loadScrollState(elements);
		startAccompaniment();
		const orchestra = createEnsemblePanel('Live Orchestra');
		const settingsHost = document.querySelector('.settings-content');
		settingsHost?.prepend(orchestra);
		loading.update(100, 'Ready to play');
		applicationStarted = true;
		elements.appContainer.style.display = 'flex';
		elements.startScreen.style.display = 'none';
		loading.complete();
		// Scroll geometry must be measured after the keyboard has a visible width.
		requestAnimationFrame(() => {
			updateScrollbarThumbs();
			requestAnimationFrame(updateScrollbarThumbs);
		});
		scheduleLazyStudios(elements);
		return true;
	} catch (error) {
		console.error('Piano startup failed', error);
		loading.fail('Piano could not finish starting. Reload to try again.');
		return false;
	}
}

/** Restores the familiar default sound after saved settings are applied. */
function reapplyCanonicalDefault(elements) {
	if (elements.soundPresetSelect?.value === DEFAULT_PRESET_ID) {
		applyPresetToElements(elements, getSoundPreset(DEFAULT_PRESET_ID));
	}
}
