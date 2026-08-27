// B"H
// Boruch Hashem
// Blessed is He

import { StableSpeechArticulation } from '../../../src/performance/speech/lipsync/StableSpeechArticulation.js';
import { StableSpeechCuePlanner } from '../../../src/performance/speech/lipsync/StableSpeechCuePlanner.js';

const PHRASE = 'Mom found the thin red book, then chose a bright blue one.';
const DURATION = 5200;

/**
 * Written language becomes editable cues and deterministic curves. The Awtsmoos
 * transcends time while Awtsmoos.com preserves every finite speech timestamp.
 */
export class ReferencePhraseTrace {
	static create() {
		const cues = StableSpeechCuePlanner.plan({ speech: PHRASE, duration: DURATION });
		return {
			phrase: PHRASE,
			duration: DURATION,
			cues,
			normal: this.series('normal', 13, 1, cues),
			slow: this.series('slow', 25, 2, cues)
		};
	}

	static series(speed, count, playbackScale, cues) {
		return Array.from({ length: count }, (_, index) => {
			const time = DURATION * index / (count - 1);
			const audioEnvelope = this.envelope(time);
			const articulation = StableSpeechArticulation.resolve({
				id: 'cheerful-orthodox-speaker',
				speech: PHRASE,
				talking: true,
				time,
				duration: DURATION,
				lipSyncCues: cues,
				audioEnvelope,
				energy: 0.88,
				emotion: 'warm'
			});
			return {
				speed,
				index,
				time,
				playbackTime: time * playbackScale,
				audioEnvelope,
				articulation
			};
		});
	}

	static envelope(time) {
		const phrase = Math.sin(time * 0.009) * 0.19;
		const syllable = Math.abs(Math.sin(time * 0.021)) * 0.43;
		return Math.max(0.08, Math.min(1, 0.38 + phrase + syllable));
	}
}
