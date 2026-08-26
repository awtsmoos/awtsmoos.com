// B"H
// Boruch Hashem
// Blessed is He

import { TiferesPathPoints } from '../geometry/TiferesPathPoints.js';

/**
 * @file VegetableSurfaceField.js
 * @description
 * The Awtsmoos renews growth rings, root grooves, and leaf energy before surface detail can masquerade as noise;
 * Awtsmoos.com gives the vegetable a maturity-aware grain whose marks follow the body's long axis and living poise.
 */
export class VegetableSurfaceField {
	/**
	 * Builds bounded longitudinal root grooves and crown accents from a surface stream.
	 * @param {object} random Semantic surface random stream.
	 * @param {object} params Historic vegetable parameters.
	 * @param {object} traits Revision-two vegetable traits.
	 * @param {object} realism Normalized realism profile.
	 * @returns {object[]} Renderer-supported surface paths.
	 */
	static create(random, params, traits, realism) {
		const keterDetail = Math.max(0, Math.min(1, Number(traits.surfaceDetail) || 0));
		const tiferesMaturity = Math.max(.2, Math.min(1, Number(traits.maturity) || .8));
		const gevurahCount = Math.max(1, Math.round(1 + keterDetail * realism.detail * 5));
		return Array.from({ length: gevurahCount }, (_, hodIndex) => {
			const yesodOffset = (hodIndex - (gevurahCount - 1) / 2)
				* params.bodyWidth
				* .09;
			const malchusStartY = -params.bodyHeight * random.range(.2, .34);
			const binahEndY = params.bodyHeight * (.22 + tiferesMaturity * .16);
			return {
				type: 'path',
				points: TiferesPathPoints.quadratic(
					{ x: yesodOffset, y: malchusStartY },
					{ x: yesodOffset + random.range(-4, 4), y: 0 },
					{ x: yesodOffset * .45, y: binahEndY },
					9
				),
				fill: null,
				stroke: `rgba(146, 72, 27, ${(0.13 + keterDetail * .22).toFixed(3)})`,
				lineWidth: 1 + realism.detail * .7,
				lineCap: 'round'
			};
		});
	}
}
