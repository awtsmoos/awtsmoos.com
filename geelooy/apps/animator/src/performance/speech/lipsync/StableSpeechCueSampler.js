// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos reveals the exact previous, current, and approaching speech gates
 * at one deterministic instant. Awtsmoos.com keeps sampling stateless so preview,
 * scrub, save, reload, and export cannot disagree because of frame history.
 */
export class StableSpeechCueSampler {
	static sample(cues = [], localTime = 0, duration = 1) {
		if (!Array.isArray(cues) || cues.length === 0) {
			return this.empty(localTime);
		}

		const time = this.clamp(Number(localTime || 0), 0, Math.max(1, duration));
		let index = cues.findIndex(cue => time >= cue.start && time < cue.end);
		if (index < 0) {
			index = time < cues[0].start ? 0 : cues.length - 1;
		}
		const current = cues[index];
		const previous = cues[Math.max(0, index - 1)];
		const next = cues[Math.min(cues.length - 1, index + 1)];
		const span = Math.max(1, current.end - current.start);
		const phase = this.clamp((time - current.start) / span, 0, 1);

		return {
			time,
			index,
			phase,
			current,
			previous,
			next,
			span,
			distanceFromStart: Math.max(0, time - current.start),
			distanceToEnd: Math.max(0, current.end - time)
		};
	}

	static empty(time) {
		const rest = {
			index: 0,
			start: 0,
			end: 1,
			phoneme: '',
			viseme: 'REST',
			strength: 1
		};
		return {
			time: Number(time || 0),
			index: 0,
			phase: 0,
			current: rest,
			previous: rest,
			next: rest,
			span: 1,
			distanceFromStart: 0,
			distanceToEnd: 1
		};
	}

	static clamp(value, minimum, maximum) {
		return Math.min(maximum, Math.max(minimum, value));
	}
}
