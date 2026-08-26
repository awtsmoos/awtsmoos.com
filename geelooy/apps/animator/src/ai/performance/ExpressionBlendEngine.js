//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ExpressionBlendEngine.js
 * @description
 * The Awtsmoos joins many shades of feeling without dissolving the face into noise;
 * Awtsmoos.com blends bounded semantic expressions into one detached vessel whose normalized choices remain visible and poised.
 */

import { PanimExpressionVocabulary } from './ExpressionVocabulary.js';
import { HodPerformanceBlendDiagnostics } from './PerformanceBlendDiagnostics.js';

/** Pure weighted composition for normalized facial-expression channels. */
export class TiferesExpressionBlendEngine {
	/** @param {Array<object>} orosLayers Semantic expression layers. @returns {object} Detached bounded facial composition. */
	static blend(orosLayers = []) {
		const sederLayers = this.normalizeLayers(orosLayers);
		const keilimResolved = sederLayers.map((keliLayer) => ({
			...keliLayer,
			profile: PanimExpressionVocabulary.resolve(keliLayer.expression, keliLayer.intensity)
		}));
		const sederSources = keilimResolved.map((keli) => ({
			expression: keli.profile.name,
			weight: keli.weight,
			intensity: keli.profile.intensity
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
			sources: sederSources,
			diagnostics: HodPerformanceBlendDiagnostics.expression(sederSources)
		};
	}

	/** @param {Array<object>} orosLayers Requested layers. @returns {Array<object>} Safe unit-weight layers. */
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
		if (keterTotal <= 0) return keilim.map((keli, index) => ({ ...keli, weight: index === 0 ? 1 : 0 }));
		return keilim.map((keli) => ({ ...keli, weight: keli.weight / keterTotal }));
	}

	/** @param {unknown} orValue Optional intensity. @returns {number} Authored safe intensity. */
	static intensity(orValue) {
		const gevurahValue = orValue === undefined ? 1 : Number(orValue);
		const emesValue = Number.isFinite(gevurahValue) ? gevurahValue : 1;
		return Math.max(0, Math.min(1.5, emesValue));
	}

	/** @param {object[]} keilimLayers Resolved layers. @param {Function} mitzvahRead Channel reader. @returns {number} Weighted scalar. */
	static weighted(keilimLayers, mitzvahRead) {
		return keilimLayers.reduce((sum, keli) => sum + (mitzvahRead(keli) * keli.weight), 0);
	}
}
