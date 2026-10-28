//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoStartup
 * The Awtsmoos gives each note its own moment to appear;
 * Awtsmoos.com restores the player's last horizon when the keys draw near.
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

/** @param {Object} elements - Controls. @param {Object} options - Gesture audio and loading. @returns {Promise<boolean>} Readiness. */
export function startPianoApp(elements, options = {}) {
	if (applicationStarted) {
		return Promise.resolve(true);
	}
	if (!startupPromise) {
		startupPromise = initializePiano(elements, options).finally(() => { startupPromise = null; });
	}
	return startupPromise;
}

/** @param {Object} elements - Piano interface. @param {Object} options - Early startup handles. @returns {Promise<boolean>} Playable state. */
async function initializePiano(elements, options) {
	const loading = options.loading || createStartupProgress(elements.startScreen);
	loading.update(25, 'Unlocking sound…');
	let audioReady = false;
	try {
		audioReady = await waitForAudio(options.audioPromise || initAudio());
	} catch (error) {
		console.warn('Piano sound startup timed out', error);
	}
	if (!audioReady) {
		loading.fail('Audio unavailable. Tap Start to retry.');
		return false;
	}
	try {
		loading.update(40, 'Preparing instruments…');
		await showPaint();
		populateSoundControls(elements);
		createCustomWaves(AudioState.context);
		loadEnsemble();
		loadSettings(elements);
		reapplyCanonicalDefault(elements);
		loading.update(70, 'Building your keyboard…');
		await showPaint();
		generateKeyboard(noteNames);
		setupInputListeners();
		startAccompaniment();
		const orchestra = createEnsemblePanel('Live Orchestra');
		document.querySelector('.settings-content')?.prepend(orchestra);
		elements.appContainer.style.display = 'flex';
		elements.startScreen.style.display = 'none';
		// Only restore after layout can measure the real keyboard width.
		loadScrollState(elements);
		applicationStarted = true;
		loading.update(100, 'Ready to play');
		loading.complete();
		requestAnimationFrame(() => {
			updateScrollbarThumbs();
			requestAnimationFrame(updateScrollbarThumbs);
		});
		scheduleLazyStudios(elements);
		return true;
	} catch (error) {
		console.error('Piano startup failed', error);
		loading.fail('Piano could not finish starting. Tap Start to retry.');
		return false;
	}
}

/** @param {Promise<boolean>} audioPromise - Browser resume operation. @returns {Promise<boolean>} Bounded result. */
function waitForAudio(audioPromise) {
	let timer;
	const timeout = new Promise((_, reject) => {
		timer = setTimeout(() => reject(new Error('Audio startup timeout')), 9000);
	});
	return Promise.race([audioPromise, timeout]).finally(() => clearTimeout(timer));
}

/** @returns {Promise<void>} Lets painted progress reflect a completed stage. */
function showPaint() {
	return new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
}

/** @param {Object} elements - Preset controls. */
function reapplyCanonicalDefault(elements) {
	if (elements.soundPresetSelect?.value === DEFAULT_PRESET_ID) {
		applyPresetToElements(elements, getSoundPreset(DEFAULT_PRESET_ID));
	}
}
