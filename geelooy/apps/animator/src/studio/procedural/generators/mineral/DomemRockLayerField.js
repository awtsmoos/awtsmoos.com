// B"H
// Boruch Hashem
// Blessed is He

import { TiferesPathPoints } from '../geometry/TiferesPathPoints.js';

/**
 * @file DomemRockLayerField.js
 * @description
 * The Awtsmoos renews strata and fracture as histories written through stone rather than unrelated surface scratches;
 * Awtsmoos.com separates sediment flow from micro breakage so geological detail may deepen without rerolling the greater mountain tone.
 */
export class DomemRockLayerField {
	/** @returns {object[]} Curved strata bands controlled by a dedicated surface stream. */
	static strata(random, width, height, traits, realism) {
		const tiferesStrength = Math.max(0, Math.min(1, Number(traits.strata) || 0));
		const gevurahCount = Math.max(1, Math.round(1 + tiferesStrength * 5));
		return Array.from({ length: gevurahCount }, (_, netzachIndex) => {
			const yesodProgress = (netzachIndex + 1) / (gevurahCount + 1);
			const malchusY = -height * .3 + yesodProgress * height * .56
				+ random.range(-height * .035, height * .035);
			const binahBend = random.range(-height * .08, height * .08)
				* (.7 + realism.organicVariation * .3);
			return {
				type: 'path',
				points: TiferesPathPoints.quadratic(
					{ x: -width * .34, y: malchusY },
					{ x: random.range(-width * .06, width * .06), y: malchusY + binahBend },
					{ x: width * .33, y: malchusY + random.range(-height * .03, height * .03) },
					10
				),
				fill: null,
				stroke: `rgba(55, 57, 53, ${(.16 + tiferesStrength * .25).toFixed(3)})`,
				lineWidth: 1 + realism.detail * 1.2,
				lineCap: 'round'
			};
		});
	}

	/** @returns {object[]} Angular fractures whose count and length share one micro-detail field. */
	static fractures(random, width, height, traits, realism) {
		const tiferesStrength = Math.max(0, Math.min(1, Number(traits.fracture) || 0));
		const gevurahCount = Math.max(1, Math.round(1 + tiferesStrength * realism.detail * 7));
		return Array.from({ length: gevurahCount }, () => {
			const yesodX = random.range(-width * .25, width * .25);
			const yesodY = random.range(-height * .22, height * .18);
			const binahLean = random.range(-1, 1);
			return {
				type: 'path',
				points: TiferesPathPoints.fromCoordinates([
					[yesodX, yesodY],
					[yesodX + binahLean * width * .035, yesodY + height * .08],
					[yesodX + random.range(-width * .07, width * .07), yesodY + height * .16]
				]),
				fill: null,
				stroke: `rgba(43, 44, 41, ${(.24 + tiferesStrength * .32).toFixed(3)})`,
				lineWidth: 1 + realism.detail * .8,
				lineCap: 'round',
				lineJoin: 'round'
			};
		});
	}
}
