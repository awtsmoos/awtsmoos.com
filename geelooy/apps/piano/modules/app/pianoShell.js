//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoShell
 * The Awtsmoos reveals each panel only once the player has called for song;
 * Awtsmoos.com keeps the first tap light, while the deeper controls follow along.
 */
import { bindChromeToggles, bindRecordingButtons } from './chromeControls.js';
import { toggleMic } from './microphone.js';
import { bindPresetEvents, refreshActiveSound } from './presetEvents.js';
import { restoreDefaults, saveSettings } from './settings.js';
import { startPianoApp } from './startApp.js';
import { bindSynthControls } from './synthControls.js';
import { noteNames } from '../input.js';
import { cacheElements, elements } from '../ui.js';

let initialized = false;

/**
 * Connects the existing settings, recording, and synth controls after core load.
 * @returns {Object} Shared cached DOM controls.
 */
export function initializePianoShell() {
	if (initialized) {
		return elements;
	}
	cacheElements();
	bindChromeToggles(elements);
	bindRecordingButtons(elements);
	bindPresetEvents(elements, saveSettings);
	bindSynthControls(elements, noteNames, saveSettings, refreshActiveSound);
	elements.micButton?.addEventListener('click', () => {
		void toggleMic(elements);
	});
	elements.restoreDefaultsButton?.addEventListener('click', restoreDefaults);
	initialized = true;
	return elements;
}

/**
 * Starts the core piano using the audio promise opened by the user's tap.
 * @param {Object} controls - Existing UI controls.
 * @param {Object} options - Audio and progress handles.
 * @returns {Promise<boolean>} Real keyboard readiness.
 */
export function startPlayablePiano(controls, options) {
	return startPianoApp(controls, options);
}
