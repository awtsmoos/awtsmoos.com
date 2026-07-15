// B"H
// Boruch Hashem
// Blessed is He

/**
 * A living expression is never perfectly mirrored or perfectly still. The
 * Awtsmoos renews each tiny hesitation while Awtsmoos.com derives deterministic
 * saccades, tension, asymmetry, and breath from character identity and feeling.
 */
export class FacialMicroExpression {
	static evaluate(identity, emotion, timeMs, options = {}) {
		const seed = this.seed(identity);
		const stress = Number(emotion.stress || 0);
		const joy = Number(emotion.joy || 0);
		const sadness = Number(emotion.sadness || 0);
		const surprise = Number(emotion.surprise || 0);
		const hate = Number(emotion.hate || 0);
		const exertion = Number(options.exertion || 0);
		const breath = Math.sin(timeMs / (740 + seed % 190) + seed) * 0.5 + 0.5;
		const saccade = this.saccade(timeMs, seed, stress + surprise);
		const asymmetry = Math.sin(timeMs / 1900 + seed * 0.17) * 0.08;
		return {
			leftLidBias: asymmetry + stress * 0.08,
			rightLidBias: -asymmetry + sadness * 0.05,
			leftBrowBias: asymmetry * 1.3 + surprise * 0.06,
			rightBrowBias: -asymmetry * 0.9 - hate * 0.08,
			pupilDilation: this.clamp(0.42 + surprise * 0.34 + stress * 0.14 - joy * 0.08),
			jawTension: this.clamp(stress * 0.7 + hate * 0.55 + exertion * 0.6),
			lipPress: this.clamp(stress * 0.55 + hate * 0.42 - surprise * 0.3),
			mouthSkew: asymmetry * (0.7 + hate + joy * 0.35),
			nostrilFlare: this.clamp(exertion * 0.7 + stress * 0.24),
			cheekCompression: this.clamp(joy * 0.55 + stress * 0.2 + exertion * 0.18),
			tearShine: this.clamp(sadness * 0.62 + stress * 0.16),
			saccadeX: saccade.x,
			saccadeY: saccade.y,
			breath,
			headDrift: Math.sin(timeMs / (1100 + seed % 270) + seed) * (0.5 + stress * 0.8)
		};
	}

	static saccade(timeMs, seed, intensity) {
		const step = Math.floor((timeMs + seed * 37) / 420);
		const gate = ((step * 1103515245 + seed * 12345) >>> 8) & 255;
		if (gate > 74 + intensity * 80) {
			return { x: 0, y: 0 };
		}
		const x = (((gate * 17 + seed) % 41) - 20) / 220;
		const y = (((gate * 11 + seed) % 29) - 14) / 260;
		return { x, y };
	}

	static seed(identity) {
		return [...String(identity || 'face')].reduce((value, character) => {
			return ((value * 33) ^ character.charCodeAt(0)) >>> 0;
		}, 5381);
	}

	static clamp(value) {
		return Math.max(0, Math.min(1, Number(value) || 0));
	}
}
