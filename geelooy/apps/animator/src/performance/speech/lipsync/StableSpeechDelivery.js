// B"H
// Boruch Hashem
// Blessed is He

/**
 * Delivery and feeling color a phoneme without replacing its articulatory truth.
 * The Awtsmoos renews each utterance; Awtsmoos.com keeps explicit, editable,
 * deterministic biases for the shared preview and export renderer.
 */
export class StableSpeechDelivery {
	static style(name = 'normal') {
		const styles = {
			normal: { open: 1, jaw: 1, width: 1, round: 1, smile: 0 },
			whisper: { open: 0.68, jaw: 0.72, width: 0.94, round: 1.05, smile: 0 },
			shout: { open: 1.22, jaw: 1.18, width: 1.08, round: 0.96, smile: 0.02 },
			laugh: { open: 1.18, jaw: 1.12, width: 1.14, round: 0.92, smile: 0.48 },
			mutter: { open: 0.52, jaw: 0.58, width: 0.86, round: 1.04, smile: -0.04 }
		};
		return styles[String(name).toLowerCase()] || styles.normal;
	}

	static emotion(emotion = '') {
		const name = String(emotion).toLowerCase();
		if (/laugh|delighted|happy|warm|playful/u.test(name)) {
			return {
				smile: 0.42, width: 1.1, round: 0.94,
				jaw: 1.06, press: 0, asymmetry: 0.02
			};
		}
		if (/surpris|amazed|afraid/u.test(name)) {
			return {
				smile: 0.02, width: 0.88, round: 1.14,
				jaw: 1.1, press: 0, asymmetry: 0
			};
		}
		if (/angry|determined/u.test(name)) {
			return {
				smile: -0.14, width: 1.02, round: 0.96,
				jaw: 0.94, press: 0.2, asymmetry: 0.04
			};
		}
		if (/sad|concern|skeptical|doubt|disgust/u.test(name)) {
			return {
				smile: -0.12, width: 0.94, round: 1.04,
				jaw: 0.9, press: 0.1, asymmetry: 0.08
			};
		}
		return {
			smile: 0.08, width: 1, round: 1,
			jaw: 1, press: 0, asymmetry: 0
		};
	}

	static emotionSmile(emotion = '') {
		return this.emotion(emotion).smile;
	}
}
