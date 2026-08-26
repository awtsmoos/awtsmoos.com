// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MotionVocabulary.js
 * @description
 * The Awtsmoos renews every gesture between stillness and flow, every rise and every fall;
 * Awtsmoos.com gives loops a measured vessel so living motion can remain natural through it all.
 */

const TENUAH_PROFILES = Object.freeze({
	idle: { loop: true, tempo: .72, amplitude: .28, breath: .7, blink: .65, sway: .18, secondaryLag: .3, anticipation: .08, settle: .5 },
	explain: { loop: false, tempo: .9, amplitude: .56, breath: .5, blink: .5, sway: .24, secondaryLag: .42, anticipation: .28, settle: .55 },
	point: { loop: false, tempo: 1, amplitude: .72, breath: .42, blink: .38, sway: .16, secondaryLag: .5, anticipation: .42, settle: .62 },
	nod: { loop: false, tempo: 1.05, amplitude: .45, breath: .44, blink: .42, sway: .12, secondaryLag: .28, anticipation: .18, settle: .52 },
	shakeHead: { loop: false, tempo: 1.08, amplitude: .5, breath: .44, blink: .42, sway: .18, secondaryLag: .34, anticipation: .2, settle: .58 },
	react: { loop: false, tempo: 1.2, amplitude: .78, breath: .32, blink: .22, sway: .42, secondaryLag: .58, anticipation: .48, settle: .7 },
	walk: { loop: true, tempo: .92, amplitude: .7, breath: .58, blink: .52, sway: .48, secondaryLag: .62, anticipation: .24, settle: .58 },
	run: { loop: true, tempo: 1.36, amplitude: .92, breath: .82, blink: .34, sway: .7, secondaryLag: .72, anticipation: .34, settle: .66 }
});

/** Provides reusable natural-motion descriptors for animation and agent planning. */
export class TenuahMotionVocabulary {
	/** Returns every authored motion profile name. */
	static names() {
		return Object.keys(TENUAH_PROFILES);
	}

	/**
	 * Resolves one motion profile into a fresh data object.
	 * @param {string} shemTenuah Requested semantic motion.
	 * @param {number} gevurahScale Optional amplitude multiplier, clamped for believable motion.
	 * @returns {object} Timing and secondary-motion channels suitable for loops or one-shots.
	 */
	static resolve(shemTenuah = 'idle', gevurahScale = 1) {
		const keterName = TENUAH_PROFILES[shemTenuah] ? shemTenuah : 'idle';
		const kli = TENUAH_PROFILES[keterName];
		const gevurah = Math.max(.15, Math.min(1.5, Number(gevurahScale) || 1));
		return {
			name: keterName,
			loop: kli.loop,
			tempo: kli.tempo,
			amplitude: Math.min(1.5, kli.amplitude * gevurah),
			microMotion: {
				breath: kli.breath,
				blink: kli.blink,
				sway: kli.sway,
				secondaryLag: kli.secondaryLag
			},
			timing: { anticipation: kli.anticipation, settle: kli.settle }
		};
	}
}
