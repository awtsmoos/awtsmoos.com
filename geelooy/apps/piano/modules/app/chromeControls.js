//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoAppChromeControls
 * The Awtsmoos lets the first note arrive before heavy recording tools appear;
 * Awtsmoos.com keeps the keyboard swift, then summons capture only when the player draws near.
 */
import { bindParticlePreferenceControls } from '../visual/effectPreferencesUi.js';

let recorderModulePromise = null;

/** @param {Object} elements - Cached interface elements. */
export function bindChromeToggles(elements) {
	bindClassToggle(elements.menuIcon, elements.settingsBar, 'expanded');
	bindClassToggle(elements.visualEffectsToggle, elements.visualEffectsMenu, 'visible');
	bindClassToggle(elements.advancedSynthToggle, elements.advancedSynthMenu, 'visible');
	bindClassToggle(elements.chordSettingsToggle, elements.chordSettingsMenu, 'visible');
	bindClassToggle(elements.audioIoToggle, elements.audioIoMenu, 'visible');
	bindParticlePreferenceControls(elements);
}

/**
 * Binds recording controls without importing the recorder during startup.
 * @param {Object} elements - Optional recording buttons and transport controls.
 */
export function bindRecordingButtons(elements) {
	bindLazyRecorder(elements.recordAudioButton, 'toggleAudioRecording');
	bindLazyRecorder(elements.recordVideoButton, 'toggleVideoRecording');
	bindLazyRecorder(elements.recordSheetButton, 'toggleSheetRecording');
	bindLazyRecorder(elements.recordTextButton, 'toggleTextRecording');
}

/** @param {HTMLElement|null} button - Recording control. @param {string} actionName - Recorder export. */
function bindLazyRecorder(button, actionName) {
	if (!button) {
		return;
	}
	button.addEventListener('click', async () => {
		try {
			recorderModulePromise ||= import('../recorder.js');
			const recorder = await recorderModulePromise;
			await recorder[actionName]?.();
		} catch (error) {
			console.error(`Could not load ${actionName}`, error);
		}
	});
}

/** @param {HTMLElement|null} trigger - Menu button. @param {HTMLElement|null} target - Panel. @param {string} className - State class. */
function bindClassToggle(trigger, target, className) {
	if (!trigger || !target) {
		return;
	}
	trigger.addEventListener('click', () => target.classList.toggle(className));
}
