// B"H
// Boruch Hashem
// Blessed is He

import { StableVisemeLibrary } from './StableVisemeLibrary.js';

/**
 * The Awtsmoos receives human-authored phoneme timing without changing its finite
 * meaning. Awtsmoos.com normalizes milliseconds or progress into one durable cue
 * covenant that survives save, reload, timeline edits, and export.
 */
export class StableAuthoredCueNormalizer {
	static normalize(cues = [], duration = 1) {
		const normalizedTime = cues.every(cue => (
			cue.normalized === true
			|| cue.unit === 'normalized'
			|| Number(cue.end ?? cue.at ?? 0) <= 1
		));
		let cursor = 0;
		return cues.map((cue, index) => {
			const rawStart = Number(cue.start ?? cue.at ?? cursor);
			const rawEnd = Number(
				cue.end
				?? rawStart + Number(cue.duration || duration / cues.length)
			);
			const scale = normalizedTime ? duration : 1;
			const start = Math.max(0, rawStart * scale);
			const end = Math.max(start + 1, rawEnd * scale);
			cursor = end / scale;
			return {
				index,
				start,
				end,
				phoneme: String(
					cue.phoneme || cue.symbol || cue.viseme || ''
				),
				viseme: StableVisemeLibrary.normalize(
					cue.viseme || cue.phoneme || cue.symbol
				),
				strength: this.clamp(Number(cue.strength ?? 1), 0, 1.5)
			};
		}).sort((left, right) => left.start - right.start);
	}

	static clamp(value, minimum, maximum) {
		return Math.min(maximum, Math.max(minimum, value));
	}
}
