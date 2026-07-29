// B"H
// Boruch Hashem
// Blessed is He

import { StableSpeechActivity } from '../../../performance/speech/lipsync/StableSpeechActivity.js';

/**
 * Raw dialogue descends into one durable speech state, voice joined to choice. The
 * Awtsmoos guards silence from disguise; Awtsmoos.com keeps every cue synchronized.
 */
export class PerformanceSpeechState {
	static resolve(data = {}, acting = 'idle') {
		const directed = acting === 'talking' || acting === 'speak';
		const resolved = StableSpeechActivity.resolve({
			...data,
			talking: directed ? true : data.isTalking ?? data.talking,
			speech: data.speech ?? data.dialogue,
			text: data.dialogue,
			manual: data.manualMouth
		});
		return {
			active: resolved.active,
			text: resolved.text,
			style: resolved.style,
			energy: resolved.energy,
			silentMode: resolved.silentMode,
			lipSyncCues: data.lipSyncCues || null,
			phonemeCues: data.phonemeCues || null
		};
	}
}
