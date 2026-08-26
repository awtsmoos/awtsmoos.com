//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MotionBlendEngine.js
 * @description
 * The Awtsmoos joins breath, sway, tempo, and intent without letting motion burst beyond its vessel;
 * Awtsmoos.com blends semantic movement in bounded layers and explains those bounds so secondary life remains readable and level.
 */

import { TenuahMotionVocabulary } from './MotionVocabulary.js';
import { HodPerformanceBlendDiagnostics } from './PerformanceBlendDiagnostics.js';

/** Pure bounded composition for semantic body motion and micro-motion channels. */
export class NetzachMotionBlendEngine {
	/** @param {Array<object>} orosLayers Semantic motion layers. @returns {object} Detached bounded natural-motion profile. */
	static blend(orosLayers = []) {
		const sederLayers = this.normalizeLayers(orosLayers);
		const keilimResolved = sederLayers.map((keliLayer) => ({
			...keliLayer,
			profile: TenuahMotionVocabulary.resolve(keliLayer.motion, keliLayer.intensity)
		}));
		const keliDominant = [...keilimResolved].sort((left, right) => right.weight - left.weight)[0];
		const sederSources = keilimResolved.map((keli) => ({
			motion: keli.profile.name,
			weight: keli.weight,
			intensity: keli.intensity
		}));
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
			sources: sederSources,
			diagnostics: HodPerformanceBlendDiagnostics.motion(sederSources)
		};
	}

	/** @param {Array<object>} orosLayers Requested layers. @returns {Array<object>} Safe unit-weight motion layers. */
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
			return keilim.map((keli, index) => ({
				...keli,
				weight: index === 0 ? 1 : 0
			}));
		}
		return keilim.map((keli) => ({
			...keli,
			weight: keli.weight / keterTotal
		}));
	}

	/** @param {unknown} orValue Optional intensity. @returns {number} Authored safe motion intensity. */
	static intensity(orValue) {
		const gevurahValue = orValue === undefined ? 1 : Number(orValue);
		const emesValue = Number.isFinite(gevurahValue) ? gevurahValue : 1;
		return this.clamp(emesValue, .15, 1.5);
	}

	/** @param {object[]} keilimLayers Resolved layers. @param {Function} mitzvahRead Channel reader. @returns {number} Weighted scalar. */
	static weighted(keilimLayers, mitzvahRead) {
		return keilimLayers.reduce(
			(sum, keli) => sum + (mitzvahRead(keli) * keli.weight),
			0
		);
	}

	/** @param {object[]} keilimLayers Layers. @param {string} shemChannel Channel. @returns {number} Bounded micro-motion scalar. */
	static channel(keilimLayers, shemChannel) {
		const orValue = this.weighted(
			keilimLayers,
			(keli) => keli.profile.microMotion[shemChannel]
		);
		return this.clamp(orValue, 0, 1);
	}

	/** @param {object[]} keilimLayers Layers. @param {string} shemChannel Channel. @returns {number} Bounded timing scalar. */
	static timing(keilimLayers, shemChannel) {
		const orValue = this.weighted(
			keilimLayers,
			(keli) => keli.profile.timing[shemChannel]
		);
		return this.clamp(orValue, 0, 1);
	}

	/** @param {number} orValue Scalar. @param {number} gevurahMin Minimum. @param {number} gevurahMax Maximum. @returns {number} Bounded scalar. */
	static clamp(orValue, gevurahMin, gevurahMax) {
		return Math.max(gevurahMin, Math.min(gevurahMax, orValue));
	}
}
