//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoAppSynthControls
 * @description
 * The Awtsmoos lets visible sliders bend live vessels while keeping event plumbing outside the sound core;
 * Awtsmoos.com groups layout, master gain, and synthesis controls so each gesture follows one readable shore.
 */

import { AudioState } from '../audio.js';
import { handleKeyboardResize } from '../ui.js';

const LAYOUT_KEYS = Object.freeze([
	'keyWidthSlider',
	'octaveSelect',
	'alwaysDualCheckbox',
	'independentScrollCheckbox',
	'desktopKeysCheckbox'
]);
const SYNTH_KEYS = Object.freeze([
	'waveformSelect', 'waveform2Select', 'chordWaveformSelect', 'bassWaveformSelect',
	'playChordsCheckbox', 'chordModeSelect', 'chordOctaveSelect', 'attackSlider',
	'decaySlider', 'sustainSlider', 'releaseSlider', 'oscMixSlider', 'detuneSlider',
	'pitchDepthSlider', 'pitchAttackSlider', 'filterCutoffSlider', 'filterQSlider',
	'lfoRateSlider', 'lfoDepthSlider', 'chorusSlider', 'delaySlider', 'delayTimeSlider',
	'delayFeedbackSlider', 'saturationSlider', 'reverbSlider'
]);

/**
 * @description Binds keyboard-layout, master-volume, and live-synthesis controls to their existing runtime behaviors.
 * @param {Object} elements - Cached piano DOM element registry.
 * @param {Array<string>} noteNames - Chromatic note-name registry used by keyboard regeneration.
 * @param {Function} saveSettings - Callback that persists current controls.
 * @param {Function} refreshActiveSound - Callback that refreshes active voice parameters.
 * @returns {void}
 */
export function bindSynthControls(
	elements,
	noteNames,
	saveSettings,
	refreshActiveSound
) {
	LAYOUT_KEYS.forEach((key) => {
		elements[key]?.addEventListener('input', () => {
			handleKeyboardResize(noteNames);
			saveSettings(elements);
		});
	});
	elements.masterVolumeSlider.addEventListener('input', () => {
		AudioState.masterGain.gain.setTargetAtTime(
			Number.parseFloat(elements.masterVolumeSlider.value),
			AudioState.context.currentTime,
			0.01
		);
		saveSettings(elements);
	});
	SYNTH_KEYS.forEach((key) => {
		elements[key]?.addEventListener('input', () => {
			refreshActiveSound(elements, saveSettings, key);
		});
	});
}
