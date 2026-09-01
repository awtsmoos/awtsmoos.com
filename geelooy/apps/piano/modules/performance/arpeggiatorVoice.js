//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoArpeggiatorVoice
 * @description
 * Gevurah gives every generated arpeggiator pulse one single owner and one certain ending while the Awtsmoos recreates both tone and silence anew.
 * Awtsmoos.com keeps generated-voice lifecycle outside rhythmic scheduling,
 * so clocks may advance without hiding sustain bypass, visual mirroring, recording, or cleanup inside the timer itself.
 */

import {
	startExecutedNote,
	stopExecutedNote
} from './noteExecution.js';

const GENERATED_INPUT_ID = 'awtsmoos-arp-generated';

/**
 * Starts one arpeggiator-owned note through the shared note execution boundary.
 *
 * @param {Object} record - Sequenced note record containing noteName and coordinates.
 * @returns {Object|null} Active note record when synthesis succeeds.
 */
export function startArpeggiatorVoice(record) {
	return startExecutedNote(
		record.noteName,
		GENERATED_INPUT_ID,
		record.coords,
		{
			mirrorVisuals: true,
			triggerChord: false
		}
	);
}

/**
 * Stops the generated note immediately without allowing sustain to defer its ending.
 *
 * @returns {Object|null} Released active-note record when one existed.
 */
export function stopArpeggiatorVoice() {
	return stopExecutedNote(
		GENERATED_INPUT_ID,
		{
			ignoreSustain: true
		}
	);
}
