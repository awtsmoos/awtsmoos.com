//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoMain
 * @description
 * The Awtsmoos renews the whole instrument while this file remains only its small public doorway;
 * Awtsmoos.com now sends startup, controls, persistence, microphone, and readiness into focused vessels along the way.
 */

import {
	bindChromeToggles,
	bindRecordingButtons
} from './modules/app/chromeControls.js';
import { toggleMic } from './modules/app/microphone.js';
import {
	bindPresetEvents,
	refreshActiveSound
} from './modules/app/presetEvents.js';
import {
	restoreDefaults,
	saveSettings
} from './modules/app/settings.js';
import { startPianoApp } from './modules/app/startApp.js';
import { bindSynthControls } from './modules/app/synthControls.js';
import { noteNames } from './modules/input.js';
import { cacheElements, elements } from './modules/ui.js';

document.addEventListener('DOMContentLoaded', initializePianoShell);

/**
 * @description Caches the DOM and binds shell controls before the explicit user start gesture initializes Web Audio.
 * @returns {void}
 */
function initializePianoShell() {
	cacheElements();
	bindChromeToggles(elements);
	bindRecordingButtons(elements);
	bindPresetEvents(elements, saveSettings);
	bindSynthControls(elements, noteNames, saveSettings, refreshActiveSound);
	elements.micButton.addEventListener('click', handleMicClick);
	elements.startButton.addEventListener('click', handleStartClick);
	elements.restoreDefaultsButton.addEventListener('click', restoreDefaults);
}

/**
 * @description Starts the playable piano through the focused application bootstrap.
 * @returns {void}
 */
function handleStartClick() {
	void startPianoApp(elements);
}

/**
 * @description Toggles microphone state through its isolated audio-graph lifecycle module.
 * @returns {void}
 */
function handleMicClick() {
	void toggleMic(elements);
}
