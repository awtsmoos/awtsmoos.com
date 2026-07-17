// B"H
// Boruch Hashem
// Blessed is He

import { StableAuthoredCueNormalizer } from './StableAuthoredCueNormalizer.js';
import { StableSpeechTextTokenizer } from './StableSpeechTextTokenizer.js';

/**
 * The Awtsmoos orders authored timing or written language into visible speech.
 * Awtsmoos.com prefers artist-authored cues, then falls back to deterministic
 * digraph-aware timing that may later be materialized and edited.
 */
export class StableSpeechCuePlanner {
	static plan(input = {}) {
		const duration = Math.max(1, Number(input.duration || 1600));
		const authored = input.lipSyncCues || input.phonemeCues;
		if (Array.isArray(authored) && authored.length > 0) {
			return StableAuthoredCueNormalizer.normalize(authored, duration);
		}
		return this.fromText(String(input.speech || ''), duration);
	}

	static fromText(speech, duration) {
		const tokens = StableSpeechTextTokenizer.tokens(speech);
		if (tokens.length === 0) {
			return [this.rest(duration)];
		}
		const totalWeight = tokens.reduce(
			(sum, token) => sum + token.weight,
			0
		);
		let cursor = 0;
		return tokens.map((token, index) => {
			const start = cursor;
			cursor += duration * token.weight / totalWeight;
			return {
				index,
				start,
				end: index === tokens.length - 1 ? duration : cursor,
				phoneme: token.text,
				viseme: token.viseme,
				strength: token.strength
			};
		});
	}

	static rest(duration) {
		return {
			index: 0,
			start: 0,
			end: duration,
			phoneme: '',
			viseme: 'REST',
			strength: 1
		};
	}
}
