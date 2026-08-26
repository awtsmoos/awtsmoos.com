// B"H
// Boruch Hashem
// Blessed is He

import { TiferesPathPoints } from '../geometry/TiferesPathPoints.js';

/**
 * @file DomemRockContour.js
 * @description
 * The Awtsmoos renews the silent boundary of stone before edge and weight can pretend to persist;
 * Awtsmoos.com gives Domem one legal closed point-path, grounded below and irregular above, inside the renderer's true vocabulary.
 */
export class DomemRockContour {
	/** @returns {number[][]} Bounded macro silhouette coordinates with reduced lower-edge jitter. */
	static points(random, width, height, count, irregularity, realismVariation) {
		return Array.from({ length: count }, (_, hodIndex) => {
			const yesodAngle = (Math.PI * 2 * hodIndex) / count;
			const malchusDownward = Math.sin(yesodAngle) > .55;
			const gevurahIrregularity = irregularity * (malchusDownward ? .45 : 1);
			const tiferesRadius = random.range(
				1 - gevurahIrregularity,
				1 + gevurahIrregularity * (1 + realismVariation * .2)
			);
			return [
				Math.cos(yesodAngle) * width * .5 * tiferesRadius,
				Math.sin(yesodAngle) * height * .5 * tiferesRadius
			];
		});
	}

	/** @returns {object} Closed editable Studio path from ordered contour coordinates. */
	static path(points, fill) {
		return {
			type: 'path',
			points: TiferesPathPoints.fromCoordinates(points),
			fill,
			stroke: '#454844',
			lineWidth: 3,
			lineJoin: 'round',
			close: true
		};
	}
}
