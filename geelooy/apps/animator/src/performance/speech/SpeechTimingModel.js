// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every syllable as a distinct instant.
 * This timing vessel turns authored speech into stable editable beats for
 * audible dialogue and silent rehearsal alike inside Awtsmoos.com.
 */
const PAUSE_PATTERN = /[\s,.;:!?—–-]/u;

export class SpeechTimingModel {
	static sample(input = {}) {
		const symbols = [...String(input.speech ?? '').normalize('NFKC')];
		const progress = this.resolveProgress(input, symbols.length);

		if (symbols.length === 0) {
			return this.emptySample(progress);
		}

		const scaled = Math.min(symbols.length - Number.EPSILON, progress * symbols.length);
		const index = Math.max(0, Math.floor(scaled));
		const phase = scaled - index;
		const symbol = symbols[index];
		const isPause = PAUSE_PATTERN.test(symbol);
		const pulse = isPause ? 0 : Math.pow(Math.sin(Math.PI * phase), 0.72);

		return {
			symbol,
			index,
			phase,
			pulse,
			isPause,
			length: symbols.length,
			progress
		};
	}

	static resolveProgress(input, symbolCount) {
		const requestedProgress = Number(input.progress);
		if (Number.isFinite(requestedProgress)) {
			return this.clamp(requestedProgress);
		}

		const duration = Math.max(1, Number(input.duration) || Math.max(420, symbolCount * 86));
		const time = Math.max(0, Number(input.time) || 0);
		return this.clamp((time % duration) / duration);
	}

	static emptySample(progress) {
		return {
			symbol: '',
			index: 0,
			phase: progress,
			pulse: Math.abs(Math.sin(progress * Math.PI * 3)),
			isPause: false,
			length: 0,
			progress
		};
	}

	static clamp(value) {
		if (!Number.isFinite(value)) {
			return 0;
		}

		return Math.min(1, Math.max(0, value));
	}
}
