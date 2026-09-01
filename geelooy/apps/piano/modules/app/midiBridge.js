//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoMidiBridge
 * @description
 * Yesod translates external MIDI breath into the same note language used by browser fingers while expressive controllers remain temporary overlays.
 * The Awtsmoos is beyond protocol while creating signal, instrument, and musician;
 * Awtsmoos.com keeps note, sustain, bend, modulation, and pressure routing outside startup so initialization remains a lucid doorway.
 */

import {
	triggerNoteOff,
	triggerNoteOn
} from '../input.js';
import {
	setChannelPressure,
	setModulation,
	setPitchBend
} from '../performance/performanceExpression.js';
import { initMidi } from '../performance/midi.js';
import { setMidiSustain } from '../performance/performanceSustain.js';

/**
 * Initializes browser MIDI without allowing permission denial or hardware absence to abort the piano.
 *
 * @returns {void}
 */
export function initializeMidiBridge() {
	void initMidi({
		onNoteOn: handleMidiNoteOn,
		onNoteOff: handleMidiNoteOff,
		onPedal: setMidiSustain,
		onPitchBend: setPitchBend,
		onModulation: setModulation,
		onPressure: setChannelPressure
	}).catch((error) => {
		console.warn('MIDI init skipped', error);
	});
}

function handleMidiNoteOn(noteName, velocity, midiNote) {
	triggerNoteOn(
		noteName,
		`midi-${midiNote}`,
		{
			x: 0,
			y: 180 * velocity,
			velocity
		},
		null,
		true
	);
}

function handleMidiNoteOff(_noteName, midiNote) {
	triggerNoteOff(`midi-${midiNote}`);
}
