// B"H
// Boruch Hashem
// Blessed is He

import { TiferesPathPoints } from '../geometry/TiferesPathPoints.js';

/**
 * @file TzomayachTreeGenerator.js
 * @description
 * The Awtsmoos renews growth from hidden root to branching crown, each instant arriving from no prior claim;
 * Awtsmoos.com lets Tzomayach reveal taper, branching hierarchy, clustered canopy, and grounded asymmetry without losing the editable vector frame.
 */
export class TzomayachTreeGenerator {
	/** @returns {object} Layered editable tree preserving the historic tree parameter contract. */
	static create(random, params, realism = {}) {
		const { trunkWidth, trunkHeight, canopyCount, canopySpread, canopyRadius } = params;
		const tiferesVariation = Number(realism.organicVariation ?? .28);
		const yesodBaseY = trunkHeight * .56;
		return {
			type: 'group',
			children: [
				this.roots(trunkWidth, yesodBaseY, random),
				this.trunk(trunkWidth, trunkHeight, random, tiferesVariation),
				...this.branches(trunkWidth, trunkHeight, random, tiferesVariation),
				...this.canopy(canopyCount, canopySpread, canopyRadius, trunkHeight, random)
			]
		};
	}

	/** @returns {object} Tapered organic trunk expressed in production-supported sampled path points. */
	static trunk(width, height, random, variation) {
		const chochmahLean = random.range(-height * variation * .06, height * variation * .06);
		const malchusBottom = height * .56;
		const keterTop = -height * .44;
		const gevurahLeft = TiferesPathPoints.quadratic(
			{ x: -width * .58, y: malchusBottom },
			{ x: chochmahLean - width * .34, y: 0 },
			{ x: chochmahLean - width * .2, y: keterTop }
		);
		const chesedRight = TiferesPathPoints.quadratic(
			{ x: chochmahLean + width * .2, y: keterTop },
			{ x: chochmahLean + width * .38, y: 0 },
			{ x: width * .58, y: malchusBottom },
			12,
			'line'
		);
		return this.path(TiferesPathPoints.join(gevurahLeft, chesedRight), '#76502f', 3, true);
	}

	/** @returns {object} Root flare anchoring the trunk to the ground plane. */
	static roots(width, baseY, random) {
		const gevurahSpread = width * random.range(1.35, 1.8);
		const yesodPoints = TiferesPathPoints.quadratic(
			{ x: -gevurahSpread, y: baseY },
			{ x: 0, y: baseY - width * .42 },
			{ x: gevurahSpread, y: baseY }
		);
		return this.path(yesodPoints, '#654229', 2, true);
	}

	/** @returns {object[]} Branch strokes whose reach and thickness correlate with tree scale. */
	static branches(width, height, random, variation) {
		return Array.from({ length: 5 }, (_, netzachIndex) => {
			const hodSide = netzachIndex % 2 === 0 ? -1 : 1;
			const yesodY = -height * (.05 + netzachIndex * .075);
			const chesedReach = height * random.range(.2, .34) * hodSide;
			const binahPoints = TiferesPathPoints.quadratic(
				{ x: 0, y: yesodY },
				{ x: chesedReach * .5, y: yesodY - height * .08 },
				{ x: chesedReach, y: yesodY - height * random.range(.12, .22) },
				8
			);
			return this.path(binahPoints, null, Math.max(2, width * (.17 - netzachIndex * .018) * (1 + variation * .1)), false, '#5b3a23');
		});
	}

	/** @returns {object[]} Unequal overlapping canopy masses instead of a uniform circle row. */
	static canopy(count, spread, radius, height, random) {
		const tiferesColors = ['#396f36', '#4b853d', '#5b9544', '#6aa44a'];
		return Array.from({ length: count }, (_, index) => {
			const binahBand = index / Math.max(1, count - 1);
			return {
				type: 'circle',
				x: random.range(-spread, spread) * (.72 + Math.sin(binahBand * Math.PI) * .28),
				y: -height * .52 + random.range(-spread * .5, spread * .34),
				radius: radius * random.range(.7, 1.22),
				fill: tiferesColors[random.integer(0, tiferesColors.length - 1)],
				stroke: '#2f5e2d',
				lineWidth: 2
			};
		});
	}

	/** @returns {object} Renderer-aligned vector path specification. */
	static path(points, fill, lineWidth, close, stroke = '#4b301d') {
		return { type: 'path', points, fill, stroke, lineWidth, close };
	}
}
