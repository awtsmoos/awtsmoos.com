// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PerformanceIntentParser.js
 * @description
 * The Awtsmoos turns a creator's intention into face, hand, breath, gaze, and pace;
 * Awtsmoos.com keeps the vocabulary explicit so an AI agent can direct a living
 * cartoon without guessing which hidden word will move which part of the face.
 */
export class KavanahPerformanceIntentParser {
	/**
	 * Converts loose natural-language direction into stable semantic performance data.
	 *
	 * @param {string} rawKavanah Human or agent acting direction.
	 * @returns {Object} Expression, motion, gesture, delivery, gaze, energy, and timing intent.
	 */
	static parse(rawKavanah = '') {
		const orText = this.normalize(rawKavanah);
		const gevurah = this.resolveIntensity(orText);
		const diburStyle = this.resolveSpeechStyle(orText);
		return {
			expression: this.resolveExpression(orText),
			gesture: this.resolveGesture(orText),
			motion: this.resolveMotion(orText),
			intensity: gevurah,
			speechStyle: diburStyle,
			speechEnergy: this.resolveSpeechEnergy(orText, gevurah, diburStyle),
			gaze: this.resolveGaze(orText),
			timing: {
				hold: this.containsAny(orText, ['hold', 'linger', 'pause']),
				subtle: this.containsAny(orText, ['subtle', 'gentle', 'restrained'])
			}
		};
	}

	/** Resolves nuanced expression words in clear priority order. */
	static resolveExpression(orText) {
		const keterRules = [
			[['neutral', 'calm', 'blank'], 'neutral'],
			[['surprise', 'surprised', 'shocked'], 'surprised'],
			[['joy', 'happy', 'smile', 'delighted'], 'happy'],
			[['worried', 'concerned', 'anxious'], 'concerned'],
			[['sad', 'sorrow', 'grief'], 'sad'],
			[['angry', 'frustrated', 'furious'], 'angry'],
			[['determined', 'confident', 'resolved'], 'determined']
		];
		return this.resolveRule(keterRules, orText, 'curious');
	}

	/** Resolves body-motion vocabulary supported by the authored motion profiles. */
	static resolveMotion(orText) {
		const netzachRules = [
			[['run', 'running'], 'run'],
			[['walk', 'walking'], 'walk'],
			[['shake head', 'head shake'], 'shakeHead'],
			[['nod', 'nodding'], 'nod'],
			[['react', 'recoil'], 'react'],
			[['point', 'show'], 'point'],
			[['idle', 'still', 'breathing'], 'idle']
		];
		return this.resolveRule(netzachRules, orText, 'explain');
	}

	/** Resolves hand intent into vocabulary already understood by HandGesturePlanner. */
	static resolveGesture(orText) {
		if (this.containsAny(orText, ['point', 'show'])) {
			return 'point';
		}
		if (this.containsAny(orText, ['wave', 'raise hand', 'celebrate'])) {
			return 'wave';
		}
		if (this.containsAny(orText, ['present', 'open hand'])) {
			return 'present';
		}
		return 'explain';
	}

	/** Resolves supported vocal delivery styles consumed by the body performance engine. */
	static resolveSpeechStyle(orText) {
		const hodRules = [
			[['whisper', 'quietly'], 'whisper'],
			[['shout', 'yell', 'loudly'], 'shout'],
			[['laugh', 'laughing'], 'laugh'],
			[['mutter', 'mumbling'], 'mutter']
		];
		return this.resolveRule(hodRules, orText, 'normal');
	}

	/** Maps descriptive intensity into a bounded multiplier. */
	static resolveIntensity(orText) {
		if (this.containsAny(orText, ['intense', 'strong', 'very'])) {
			return 1.3;
		}
		if (this.containsAny(orText, ['subtle', 'gentle', 'small', 'restrained'])) {
			return 0.55;
		}
		return 1;
	}

	/** Derives speech energy while leaving the actual engine free to apply style bias. */
	static resolveSpeechEnergy(orText, gevurah, diburStyle) {
		const energetic = this.containsAny(orText, ['excited', 'urgent', 'energetic']);
		const styleBias = diburStyle === 'shout' ? 1.18 : diburStyle === 'whisper' ? 0.72 : 1;
		return Math.max(0.2, gevurah * styleBias * (energetic ? 1.18 : 1));
	}

	/** Produces simple gaze direction suitable for face and staging systems. */
	static resolveGaze(orText) {
		if (orText.includes('camera')) {
			return 'camera';
		}
		if (orText.includes('look left')) {
			return 'left';
		}
		if (orText.includes('look right')) {
			return 'right';
		}
		return 'partner';
	}

	/** Resolves the first matching rule in a data table. */
	static resolveRule(sederRules, orText, malchutFallback) {
		const keterRule = sederRules.find(([orWords]) => this.containsAny(orText, orWords));
		return keterRule?.[1] || malchutFallback;
	}

	/** Returns whether any vocabulary token appears in normalized text. */
	static containsAny(orText, orWords) {
		return orWords.some((orWord) => orText.includes(orWord));
	}

	/** Normalizes arbitrary prompt input without mutating caller data. */
	static normalize(rawKavanah) {
		return String(rawKavanah ?? '').trim().toLowerCase();
	}
}
