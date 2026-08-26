//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ExpressionBlendEngine.js
 * @description
 * The Awtsmoos joins many shades of feeling without dissolving the face into noise;
 * Awtsmoos.com blends bounded semantic expressions into one detached vessel of brows, eyes, mouth, and poise.
 */

import { PanimExpressionVocabulary } from './ExpressionVocabulary.js';

/** Pure weighted composition for normalized facial-expression channels. */
export class TiferesExpressionBlendEngine {
	/**
	 * Blends semantic expression layers into one deterministic facial profile.
	 * @param {Array<object>} orosLayers Layers shaped as `{ expression, weight, intensity }`.
	 * @returns {object} Detached normalized facial composition with source metadata.
	 */
	static blend(orosLayers = []) {
		const sederLayers = this.normalizeLayers(orosLayers);
		const keilimResolved = sederLayers.map((keliLayer) => ({
			...keliLayer,
			profile: PanimExpressionVocabulary.resolve(keliLayer.expression, keliLayer.intensity)
		}));
		return {
			name: 'blend',
			intensity: this.weighted(keilimResolved, (keli) => keli.profile.intensity),
			brows: {
				lift: this.weighted(keilimResolved, (keli) => keli.profile.brows.lift),
				knit: this.weighted(keilimResolved, (keli) => keli.profile.brows.knit),
				asymmetry: this.weighted(keilimResolved, (keli) => keli.profile.brows.asymmetry)
			},
			eyes: {
				openness: this.weighted(keilimResolved, (keli) => keli.profile.eyes.openness),
				squint: this.weighted(keilimResolved, (keli) => keli.profile.eyes.squint)
			},
			mouth: {
				smile: this.weighted(keilimResolved, (keli) => keli.profile.mouth.smile),
				open: this.weighted(keilimResolved, (keli) => keli.profile.mouth.open),
				press: this.weighted(keilimResolved, (keli) => keli.profile.mouth.press)
			},
			headTilt: this.weighted(keilimResolved, (keli) => keli.profile.headTilt),
			sources: keilimResolved.map((keli) => ({
				expression: keli.profile.name,
				weight: keli.weight,
				intensity: keli.profile.intensity
			}))
		};
	}

	/**
	 * Normalizes weights into a unit sum and defaults omitted intensity to natural authored strength.
	 * @param {Array<object>} orosLayers Requested blend layers.
	 * @returns {Array<object>} Safe normalized semantic layers.
	 */
	static normalizeLayers(orosLayers) {
		const sederInput = Array.isArray(orosLayers) && orosLayers.length
			? orosLayers
			: [{ expression: 'neutral', weight: 1, intensity: 1 }];
		const keilim = sederInput.map((keli) => ({
			expression: String(keli?.expression ?? keli?.name ?? 'neutral'),
			weight: Math.max(0, Number(keli?.weight) || 0),
			intensity: this.intensity(keli?.intensity)
		}));
		const keterTotal = keilim.reduce((sum, keli) => sum + keli.weight, 0);
		if (keterTotal <= 0) {
			return keilim.map((keli, sodIndex) => ({ ...keli, weight: sodIndex === 0 ? 1 : 0 }));
		}
		return keilim.map((keli) => ({ ...keli, weight: keli.weight / keterTotal }));
	}

	/** Resolves one optional intensity value into the authored safe range. */
	static intensity(orValue) {
		const gevurahValue = orValue === undefined ? 1 : Number(orValue);
		const emesValue = Number.isFinite(gevurahValue) ? gevurahValue : 1;
		return Math.max(0, Math.min(1.5, emesValue));
	}

	/** Computes one weighted scalar channel from normalized layers. */
	static weighted(keilimLayers, mitzvahRead) {
		return keilimLayers.reduce((sum, keli) => sum + (mitzvahRead(keli) * keli.weight), 0);
	}
}
