//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoAppStart
 * @description
 * The Awtsmoos gathers audio, keys, MIDI, memory, accompaniment, and acoustic readiness into one beginning;
 * Awtsmoos.com keeps startup ordered here so the entry file remains a doorway rather than the whole building.
 */

import { startAccompaniment } from '../accompaniment.js';
import { AudioState, initAudio } from '../audio.js';
import {
	noteNames,
	setupInputListeners,
	triggerNoteOff,
	triggerNoteOn
} from '../input.js';
import { initMidi } from '../performance/midi.js';
import { setSustainPedal } from '../performance/pedal.js';
import {
	applyPresetToElements,
	getSoundPreset
} from '../sound/presets.js';
import { activeNotes, stopSynth } from '../synth.js';
import { generateKeyboard } from '../ui.js';
import { createCustomWaves } from '../waveforms.js';
import { warmCurrentAcousticPreset } from './presetEvents.js';
import { loadScrollState } from './scrollSettings.js';
import {
	DEFAULT_PRESET_ID,
	populateSoundControls
} from './selectSetup.js';
import { loadSettings } from './settings.js';

/**
 * @description Initializes the complete playable piano after the user's start gesture and begins predictive warming for a restored acoustic preset.
 * @param {Object} elements - Cached piano DOM element registry.
 * @returns {Promise<void>} Resolves after synchronous startup and nonblocking MIDI initialization have been launched.
 */
export async function startPianoApp(elements) {
	if (!initAudio()) {
		alert('Audio Init Failed');
		return;
	}

	populateSoundControls(elements);
	createCustomWaves(AudioState.context);
	elements.startScreen.style.display = 'none';
	elements.appContainer.style.display = 'flex';
	loadSettings(elements);
	reapplyCanonicalDefault(elements);
	generateKeyboard(noteNames);
	setupInputListeners();
	void initMidi({
		onNoteOn: handleMidiNoteOn,
		onNoteOff: handleMidiNoteOff,
		onPedal: handleMidiPedal
	}).catch(handleMidiFailure);
	loadScrollState(elements);
	startAccompaniment();
	void warmCurrentAcousticPreset(elements);
}

/**
 * @description Reprojects the canonical default preset after persistence loading, preserving the deployed rule that the default ID owns its full control climate.
 * @param {Object} elements - Cached piano DOM element registry.
 * @returns {void}
 */
function reapplyCanonicalDefault(elements) {
	if (elements.soundPresetSelect?.value !== DEFAULT_PRESET_ID) {
		return;
	}
	applyPresetToElements(
		elements,
		getSoundPreset(DEFAULT_PRESET_ID)
	);
}

/**
 * @description Converts MIDI velocity into the existing vertical-coordinate velocity contract and starts its note.
 * @param {string} noteName - Scientific pitch received from MIDI.
 * @param {number} velocity - Normalized MIDI velocity.
 * @param {number} midiNote - Numeric MIDI note used for stable input identity.
 * @returns {void}
 */
function handleMidiNoteOn(noteName, velocity, midiNote) {
	triggerNoteOn(
		noteName,
		`midi-${midiNote}`,
		{ x: 0, y: 180 * velocity }
	);
}

/**
 * @description Releases the stable input identity associated with one MIDI note-off message.
 * @param {string} _noteName - Scientific pitch supplied by MIDI but unused for identity release.
 * @param {number} midiNote - Numeric MIDI note used for stable input identity.
 * @returns {void}
 */
function handleMidiNoteOff(_noteName, midiNote) {
	triggerNoteOff(`midi-${midiNote}`);
}

/**
 * @description Routes MIDI sustain state through the shared pedal engine and active-note registry.
 * @param {boolean} down - Whether the sustain pedal is currently depressed.
 * @returns {void}
 */
function handleMidiPedal(down) {
	setSustainPedal(down, activeNotes, stopSynth);
}

/**
 * @description Keeps unsupported or denied MIDI from aborting an otherwise playable browser instrument.
 * @param {Error} error - MIDI initialization error reported by the browser.
 * @returns {void}
 */
function handleMidiFailure(error) {
	console.warn('MIDI init skipped', error);
}
