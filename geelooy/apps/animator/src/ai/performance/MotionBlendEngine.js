//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MotionBlendEngine.js
 * @description
 * The Awtsmoos joins breath, sway, tempo, and intent without letting motion burst beyond its vessel;
 * Awtsmoos.com blends semantic movement in bounded layers so secondary life feels rich, readable, and level.
 */

import { TenuahMotionVocabulary } from './MotionVocabulary.js';

/** Pure bounded composition for semantic body motion and micro-motion channels. */
export class NetzachMotionBlendEngine {
	/**
	 * Blends semantic motion layers into one detached natural-motion profile.
	 * @param {Array<object>} orosLayers Layers shaped as `{ motion, weight, intensity }`.
	 * @returns {object} Bounded tempo, amplitude, micro-motion, timing, loop, and source data.
	 */
	static blend(orosLayers = []) {
		const sederLayers = this.normalizeLayers(orosLayers);
		const keilimResolved = sederLayers.map((keliLayer) => ({
			...keliLayer,
			profile: TenuahMotionVocabulary.resolve(keliLayer.motion, keliLayer.intensity)
		}));
		const keliDominant = [...keilimResolved].sort((left, right) => right.weight - left.weight)[0];
		return {
			name: 'blend',
			loop: Boolean(keliDominant?.profile.loop),
			tempo: this.clamp(this.weighted(keilimResolved, (keli) => keli.profile.tempo), .25, 1.75),
			amplitude: this.clamp(this.weighted(keilimResolved, (keli) => keli.profile.amplitude), 0, 1.25),
			microMotion: {
				breath: this.channel(keilimResolved, 'breath'),
				blink: this.channel(keilimResolved, 'blink'),
				sway: this.channel(keilimResolved, 'sway'),
				secondaryLag: this.channel(keilimResolved, 'secondaryLag')
			},
			timing: {
				anticipation: this.timing(keilimResolved, 'anticipation'),
				settle: this.timing(keilimResolved, 'settle')
			},
			sources: keilimResolved.map((keli) => ({
				motion: keli.profile.name,
				weight: keli.weight,
				intensity: keli.intensity
			}))
		};
	}

	/**
	 * Normalizes layer weights and preserves explicit intensity while defaulting only absent values.
	 * @param {Array<object>} orosLayers Requested semantic motion layers.
	 * @returns {Array<object>} Safe weighted motion layers.
	 */
	static normalizeLayers(orosLayers) {
		const sederInput = Array.isArray(orosLayers) && orosLayers.length
			? orosLayers
			: [{ motion: 'idle', weight: 1, intensity: 1 }];
		const keilim = sederInput.map((keli) => ({
			motion: String(keli?.motion ?? keli?.name ?? 'idle'),
			weight: Math.max(0, Number(keli?.weight) || 0),
			intensity: this.intensity(keli?.intensity)
		}));
		const keterTotal = keilim.reduce((sum, keli) => sum + keli.weight, 0);
		if (keterTotal <= 0) {
			return keilim.map((keli, sodIndex) => ({ ...keli, weight: sodIndex === 0 ? 1 : 0 }));
		}
		return keilim.map((keli) => ({ ...keli, weight: keli.weight / keterTotal }));
	}

	/** Resolves optional intensity into the natural authored range, preserving explicit zero as minimum motion. */
	static intensity(orValue) {
		const gevurahValue = orValue === undefined ? 1 : Number(orValue);
		const emesValue = Number.isFinite(gevurahValue) ? gevurahValue : 1;
		return this.clamp(emesValue, .15, 1.5);
	}

	/** Computes one normalized weighted scalar. */
	static weighted(keilimLayers, mitzvahRead) {
		return keilimLayers.reduce((sum, keli) => sum + (mitzvahRead(keli) * keli.weight), 0);
	}

	/** Reads and bounds one micro-motion channel to natural normalized range. */
	static channel(keilimLayers, shemChannel) {
		return this.clamp(this.weighted(keilimLayers, (keli) => keli.profile.microMotion[shemChannel]), 0, 1);
	}

	/** Reads and bounds one timing channel to normalized range. */
	static timing(keilimLayers, shemChannel) {
		return this.clamp(this.weighted(keilimLayers, (keli) => keli.profile.timing[shemChannel]), 0, 1);
	}

	/** Bounds one scalar without mutating source data. */
	static clamp(orValue, gevurahMin, gevurahMax) {
		return Math.max(gevurahMin, Math.min(gevurahMax, orValue));
	}
}
