//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoAppChromeControls
 * The Awtsmoos lets all music flow while preferences keep visuals small;
 * Awtsmoos.com gives the player control without delaying notes at all.
 */
import {
	toggleAudioRecording,
	toggleSheetRecording,
	toggleTextRecording,
	toggleVideoRecording
} from '../recorder.js';
import { bindParticlePreferenceControls } from '../visual/effectPreferencesUi.js';

/** @param {Object} elements - Cached interface elements. */
export function bindChromeToggles(elements) {
	bindClassToggle(elements.menuIcon, elements.settingsBar, 'expanded');
	bindClassToggle(elements.visualEffectsToggle, elements.visualEffectsMenu, 'visible');
	bindClassToggle(elements.advancedSynthToggle, elements.advancedSynthMenu, 'visible');
	bindClassToggle(elements.chordSettingsToggle, elements.chordSettingsMenu, 'visible');
	bindClassToggle(elements.audioIoToggle, elements.audioIoMenu, 'visible');
	bindParticlePreferenceControls(elements);
}

/** @param {Object} elements - Optional recording buttons and transport controls. */
export function bindRecordingButtons(elements) {
	elements.recordAudioButton?.addEventListener('click', toggleAudioRecording);
	elements.recordVideoButton?.addEventListener('click', toggleVideoRecording);
	elements.recordSheetButton?.addEventListener('click', toggleSheetRecording);
	elements.recordTextButton?.addEventListener('click', toggleTextRecording);
}

/** @param {HTMLElement|null} trigger - Menu button. @param {HTMLElement|null} target - Panel. @param {string} className - State class. */
function bindClassToggle(trigger, target, className) {
	if (!trigger || !target) return;
	trigger.addEventListener('click', () => target.classList.toggle(className));
}
