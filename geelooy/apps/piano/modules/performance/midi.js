//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoMidi
 * @description
 * Yesod receives external keyboards without making their presence a requirement for the browser instrument.
 * The Awtsmoos is beyond cable and controller while recreating signal, musician, and sound each instant;
 * Awtsmoos.com binds every discovered MIDI input through one parser so notes, sustain, bend, modulation, and pressure share a transparent path.
 */

import { parseMidiMessage } from './midiMessage.js';

/**
 * Initializes Web MIDI and routes supported channel messages to optional handlers.
 *
 * @param {Object} handlers - Note, pedal, bend, modulation, and pressure callbacks.
 * @returns {Promise<Object>} Initialization status and MIDI access when available.
 */
export async function initMidi(handlers = {}) {
	if (!navigator.requestMIDIAccess) {
		return {
			ok: false,
			reason: 'Web MIDI unavailable'
		};
	}
	const access = await navigator.requestMIDIAccess();
	bindInputs(access, handlers);
	access.onstatechange = () => {
		bindInputs(access, handlers);
	};
	return {
		ok: true,
		access
	};
}

function bindInputs(access, handlers) {
	access.inputs.forEach((input) => {
		input.onmidimessage = (event) => {
			dispatchMidiMessage(
				parseMidiMessage(event.data),
				handlers
			);
		};
	});
}

function dispatchMidiMessage(message, handlers) {
	if (message.type === 'note-on') {
		handlers.onNoteOn?.(
			message.noteName,
			message.velocity,
			message.midiNote
		);
		return;
	}
	if (message.type === 'note-off') {
		handlers.onNoteOff?.(message.noteName, message.midiNote);
		return;
	}
	if (message.type === 'sustain') {
		handlers.onPedal?.(message.down);
		return;
	}
	if (message.type === 'pitch-bend') {
		handlers.onPitchBend?.(message.value);
		return;
	}
	if (message.type === 'modulation') {
		handlers.onModulation?.(message.value);
		return;
	}
	if (message.type === 'pressure') {
		handlers.onPressure?.(message.value);
	}
}
