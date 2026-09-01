//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoMidiMessage
 * @description
 * Binah separates raw MIDI bytes into note, pedal, bend, wheel, and pressure intentions while the Awtsmoos remains beyond protocol and packet.
 * Awtsmoos.com keeps parsing pure so hardware quirks cannot become hidden branches inside performance orchestration, and every controller can be tested without a device.
 */

import { midiToNoteName } from './notePitch.js';

/**
 * Parses one channel-voice MIDI message into a normalized performance record.
 *
 * @param {ArrayLike<number>} data - Raw MIDI bytes.
 * @returns {Object} Normalized message record with type and bounded values.
 */
export function parseMidiMessage(data) {
	const [status = 0, data1 = 0, data2 = 0] = Array.from(data || []);
	const command = status & 0xf0;
	const channel = status & 0x0f;
	if (command === 0x90 && data2 > 0) {
		return noteRecord('note-on', data1, data2, channel);
	}
	if (command === 0x80 || (command === 0x90 && data2 === 0)) {
		return noteRecord('note-off', data1, data2, channel);
	}
	if (command === 0xb0 && data1 === 64) {
		return {
			type: 'sustain',
			down: data2 >= 64,
			channel
		};
	}
	if (command === 0xb0 && data1 === 1) {
		return {
			type: 'modulation',
			value: data2 / 127,
			channel
		};
	}
	if (command === 0xe0) {
		const fourteenBit = data1 + (data2 << 7);
		return {
			type: 'pitch-bend',
			value: clamp((fourteenBit - 8192) / 8192, -1, 1),
			channel
		};
	}
	if (command === 0xd0) {
		return {
			type: 'pressure',
			value: data1 / 127,
			channel
		};
	}
	return {
		type: 'other',
		command,
		data1,
		data2,
		channel
	};
}

function noteRecord(type, midiNote, velocity, channel) {
	return {
		type,
		midiNote,
		noteName: midiToNoteName(midiNote),
		velocity: velocity / 127,
		channel
	};
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
