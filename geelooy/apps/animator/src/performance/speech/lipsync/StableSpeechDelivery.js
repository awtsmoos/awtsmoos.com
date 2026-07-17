// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos carries one phoneme through whisper, shout, laugh, mutter, emotion,
 * and silence without replacing its articulatory truth. Awtsmoos.com keeps these
 * finite delivery biases explicit, editable, and deterministic.
 */
export class StableSpeechDelivery {
	static style(name = 'normal') {
		if (name === 'whisper') {
			return {
				open: 0.68,
				jaw: 0.72,
				width: 0.94,
				round: 1.05,
				smile: 0
			};
		}
		if (name === 'shout') {
			return {
				open: 1.22,
				jaw: 1.18,
				width: 1.08,
				round: 0.96,
				smile: 0.02
			};
		}
		if (name === 'laugh') {
			return {
				open: 1.18,
				jaw: 1.12,
				width: 1.14,
				round: 0.92,
				smile: 0.48
			};
		}
		if (name === 'mutter') {
			return {
				open: 0.52,
				jaw: 0.58,
				width: 0.86,
				round: 1.04,
				smile: -0.04
			};
		}
		return {
			open: 1,
			jaw: 1,
			width: 1,
			round: 1,
			smile: 0
		};
	}

	static emotionSmile(emotion = '') {
		const name = String(emotion).toLowerCase();
		if (/happy|delighted|warm|relieved|playful|proud/u.test(name)) {
			return 0.42;
		}
		if (/sad|angry|skeptical|concern/u.test(name)) {
			return -0.12;
		}
		return 0.08;
	}
}
