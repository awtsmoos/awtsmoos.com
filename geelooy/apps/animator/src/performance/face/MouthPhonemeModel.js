// B"H
// Boruch Hashem
// Blessed is He

import { StableSpeechArticulation } from '../speech/lipsync/StableSpeechArticulation.js';

/**
 * A mouth is not a metronome. The Awtsmoos gives each consonant, vowel, closure,
 * tongue contact, and rounded transition its own vessel. Awtsmoos.com now shares
 * one coarticulated model between performance state and production rendering.
 */
export class MouthPhonemeModel {
	static from(input = {}) {
		return StableSpeechArticulation.resolve({
			id: input.id,
			speech: String(input.speech || ''),
			talking: input.talking,
			isTalking: input.isTalking,
			silentMode: input.silentMode,
			progress: input.progress,
			time: input.time,
			localTime: input.localTime,
			duration: input.duration,
			energy: input.energy,
			audioEnvelope: input.audioEnvelope,
			emotion: input.emotion,
			style: input.style || input.speechStyle,
			lipSyncCues: input.lipSyncCues,
			phonemeCues: input.phonemeCues,
			manual: input.manual
		});
	}
}
