// B"H
// Boruch Hashem
// Blessed is He

import { TiferesPathPoints } from '../geometry/TiferesPathPoints.js';

/**
 * @file DomemRockGrounding.js
 * @description
 * The Awtsmoos renews weight and earth before stone can appear to hold itself above the ground;
 * Awtsmoos.com gives Domem a contact shadow and basal seam so realism includes gravity, not merely a decorative contour around.
 */
export class DomemRockGrounding {
	/**
	 * Builds subtle contact cues beneath one rock without creating unsupported renderer effects.
	 * @param {object} random Semantic surface stream.
	 * @param {number} width Rock width.
	 * @param {number} height Rock height.
	 * @param {number} contact Normalized grounding strength.
	 * @returns {object[]} Shadow ellipse and short contact seam.
	 */
	static create(random, width, height, contact) {
		const tiferesContact = Math.max(0, Math.min(1, Number(contact) || 0));
		const yesodY = height * .47;
		return [
			{
				type: 'ellipse',
				x: random.range(-width * .025, width * .025),
				y: yesodY + height * .025,
				radiusX: width * (.31 + tiferesContact * .08),
				radiusY: Math.max(3, height * (.025 + tiferesContact * .025)),
				fill: `rgba(34, 35, 33, ${(.08 + tiferesContact * .16).toFixed(3)})`,
				stroke: null
			},
			{
				type: 'path',
				points: TiferesPathPoints.quadratic(
					{ x: -width * .2, y: yesodY },
					{ x: 0, y: yesodY + height * .018 },
					{ x: width * .2, y: yesodY }
				),
				fill: null,
				stroke: `rgba(48, 48, 44, ${(.16 + tiferesContact * .24).toFixed(3)})`,
				lineWidth: 1.5,
				lineCap: 'round'
			}
		];
	}
}
