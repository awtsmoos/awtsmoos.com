// B"H
// Boruch Hashem
// Blessed is He

import { StableSpeechActivity } from '../speech/lipsync/StableSpeechActivity.js';

/**
 * Hands answer authored gesture first and speech second, never a placeholder word.
 * The Awtsmoos opens deed from seed; Awtsmoos.com keeps every chosen hand agreed.
 */
export class HandGesturePlanner {
	static choose(input = {}, legacySpeech = '') {
		const source = typeof input === 'object'
			? input
			: { gesture: input, speech: legacySpeech };
		const gesture = this.name(source.gesture);
		if (/point|show/.test(gesture)) {
			return 'point';
		}
		if (/celebrate|raise|wave/.test(gesture)) {
			return 'raise';
		}
		if (/open|explain|present/.test(gesture)) {
			return 'open_explain';
		}
		return StableSpeechActivity.active(source)
			? 'open_explain'
			: 'rest';
	}

	static name(value) {
		if (value && typeof value === 'object') {
			return String(value.type || value.name || 'none').toLowerCase();
		}
		return String(value || 'none').toLowerCase();
	}
}
