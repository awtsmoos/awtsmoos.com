// B"H
// Boruch Hashem
// Blessed is He

import { TiferesPathPoints } from '../geometry/TiferesPathPoints.js';

/**
 * @file DomemRockSurface.js
 * @description
 * The Awtsmoos renews silent strata and fracture after the greater stone silhouette receives its boundary;
 * Awtsmoos.com keeps mineral surface witnesses separate from contour law so detail may deepen without turning one rock file into a wall.
 */
export class DomemRockSurface {
	/** @returns {string} Deterministic stone palette choice. */
	static color(random) {
		const malchusPalette = ['#77766f', '#85827a', '#6f716d', '#8c867c', '#686b67'];
		return malchusPalette[random.integer(0, malchusPalette.length - 1)];
	}

	/** @returns {object[]} Subtle sampled strata paths following the dominant mineral flow. */
	static strata(random, width, height) {
		return Array.from({ length: 3 }, (_, netzachIndex) => {
			const malchusY = -height * .2 + netzachIndex * height * .2 + random.range(-6, 6);
			return {
				type: 'path',
				points: TiferesPathPoints.quadratic(
					{ x: -width * .32, y: malchusY },
					{ x: 0, y: malchusY + random.range(-8, 8) },
					{ x: width * .31, y: malchusY + random.range(-5, 5) },
					8
				),
				fill: null,
				stroke: 'rgba(58, 60, 57, 0.34)',
				lineWidth: 2,
				lineCap: 'round'
			};
		});
	}

	/** @returns {object[]} Short angular fracture marks scaled by requested detail. */
	static fractures(random, width, height, detail) {
		const gevurahCount = Math.max(1, Math.min(6, Math.round(1 + Number(detail) * 4)));
		return Array.from({ length: gevurahCount }, () => {
			const yesodX = random.range(-width * .22, width * .22);
			const yesodY = random.range(-height * .2, height * .18);
			return {
				type: 'path',
				points: TiferesPathPoints.fromCoordinates([
					[yesodX, yesodY],
					[yesodX + random.range(-10, 10), yesodY + random.range(8, 18)],
					[yesodX + random.range(-14, 14), yesodY + random.range(18, 30)]
				]),
				fill: null,
				stroke: 'rgba(49, 51, 49, 0.46)',
				lineWidth: 1.5,
				lineCap: 'round',
				lineJoin: 'round'
			};
		});
	}
}
