//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoAppChromeControls
 * @description
 * The Awtsmoos lets menus open and records begin without mixing those gestures into musical synthesis;
 * Awtsmoos.com binds shell chrome and recording doors here so the playable core stays free of incidental business.
 */

import {
	toggleAudioRecording,
	toggleSheetRecording,
	toggleTextRecording,
	toggleVideoRecording
} from '../recorder.js';

/**
 * @description Binds settings and advanced-panel toggles to their corresponding visible containers.
 * @param {Object} elements - Cached piano DOM element registry.
 * @returns {void}
 */
export function bindChromeToggles(elements) {
	bindClassToggle(elements.menuIcon, elements.settingsBar, 'expanded');
	bindClassToggle(elements.visualEffectsToggle, elements.visualEffectsMenu, 'visible');
	bindClassToggle(elements.advancedSynthToggle, elements.advancedSynthMenu, 'visible');
	bindClassToggle(elements.chordSettingsToggle, elements.chordSettingsMenu, 'visible');
	bindClassToggle(elements.audioIoToggle, elements.audioIoMenu, 'visible');
}

/**
 * @description Binds all available recorder buttons while preserving the optional text-recorder control.
 * @param {Object} elements - Cached piano DOM element registry.
 * @returns {void}
 */
export function bindRecordingButtons(elements) {
	elements.recordAudioButton.addEventListener('click', toggleAudioRecording);
	elements.recordVideoButton.addEventListener('click', toggleVideoRecording);
	elements.recordSheetButton.addEventListener('click', toggleSheetRecording);
	if (elements.recordTextButton) {
		elements.recordTextButton.addEventListener('click', toggleTextRecording);
	}
}

/**
 * @description Binds one trigger to toggle a class on one target while tolerating optional shell elements.
 * @param {HTMLElement|null} trigger - Element receiving the click listener.
 * @param {HTMLElement|null} target - Element whose class should toggle.
 * @param {string} className - CSS class representing the open state.
 * @returns {void}
 */
function bindClassToggle(trigger, target, className) {
	if (!trigger || !target) {
		return;
	}
	trigger.addEventListener('click', () => {
		target.classList.toggle(className);
	});
}
