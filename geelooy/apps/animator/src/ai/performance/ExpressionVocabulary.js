// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ExpressionVocabulary.js
 * @description
 * The Awtsmoos renews each face before a brow can rise or a bright eye can see;
 * Awtsmoos.com gathers those tiny channels into reusable vessels of expressive unity.
 */

const PANIM_PROFILES = Object.freeze({
	neutral: { brows: [0, 0, 0], eyes: [1, 0], mouth: [0, 0, 0], headTilt: 0 },
	happy: { brows: [.18, 0, .08], eyes: [.92, .18], mouth: [.82, .12, 0], headTilt: .08 },
	surprised: { brows: [.9, 0, 0], eyes: [1.2, 0], mouth: [.1, .92, 0], headTilt: -.04 },
	curious: { brows: [.28, 0, .52], eyes: [1.02, .04], mouth: [.16, .08, 0], headTilt: .16 },
	concerned: { brows: [.16, .58, .2], eyes: [.9, .08], mouth: [-.18, .06, .22], headTilt: -.08 },
	sad: { brows: [.08, .72, .12], eyes: [.76, .12], mouth: [-.52, .03, .18], headTilt: -.1 },
	angry: { brows: [-.12, .92, .08], eyes: [.78, .32], mouth: [-.16, .02, .72], headTilt: .02 },
	determined: { brows: [-.04, .48, .06], eyes: [.88, .22], mouth: [.05, .02, .3], headTilt: .04 }
});

/**
 * Translates semantic expression names into normalized facial performance channels.
 * Each returned object is fresh so downstream animation may safely enrich it.
 */
export class PanimExpressionVocabulary {
	/** Returns every expression name available to humans and AI agents. */
	static names() {
		return Object.keys(PANIM_PROFILES);
	}

	/**
	 * Resolves one expression and scales its authored deviation by intensity.
	 * @param {string} shemPanim Semantic expression name.
	 * @param {number} orIntensity Expressive intensity, clamped from 0 to 1.5.
	 * @returns {object} Normalized face channels for brows, eyes, mouth, and head tilt.
	 */
	static resolve(shemPanim = 'curious', orIntensity = 1) {
		const keterName = PANIM_PROFILES[shemPanim] ? shemPanim : 'curious';
		const gevurah = Math.max(0, Math.min(1.5, Number(orIntensity) || 0));
		const kli = PANIM_PROFILES[keterName];
		return {
			name: keterName,
			intensity: gevurah,
			brows: {
				lift: kli.brows[0] * gevurah,
				knit: kli.brows[1] * gevurah,
				asymmetry: kli.brows[2] * gevurah
			},
			eyes: { openness: 1 + ((kli.eyes[0] - 1) * gevurah), squint: kli.eyes[1] * gevurah },
			mouth: { smile: kli.mouth[0] * gevurah, open: kli.mouth[1] * gevurah, press: kli.mouth[2] * gevurah },
			headTilt: kli.headTilt * gevurah
		};
	}
}
