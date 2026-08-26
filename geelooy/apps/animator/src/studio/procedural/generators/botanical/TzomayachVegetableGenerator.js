// B"H
// Boruch Hashem
// Blessed is He

import { TiferesPathPoints } from '../geometry/TiferesPathPoints.js';

/**
 * @file TzomayachVegetableGenerator.js
 * @description
 * The Awtsmoos renews root and leaf before the garden can claim continuity from soil to crown;
 * Awtsmoos.com gives Tzomayach a tapered edible body, sampled highlight, and botanical crown through ordinary editable vectors.
 */
export class TzomayachVegetableGenerator {
	/** @returns {object} Rich root vegetable preserving the historic five parameter names. */
	static create(random, params, realism = {}) {
		const { bodyWidth, bodyHeight, leafCount, leafHeight, leafSpread } = params;
		const tiferesVariation = Number(realism.organicVariation ?? .28);
		const malchusBottom = bodyHeight * .58;
		const keterTop = -bodyHeight * .42;
		const yesodLean = random.range(-bodyWidth * .08, bodyWidth * .08) * tiferesVariation;
		return {
			type: 'group',
			children: [
				this.body(bodyWidth, malchusBottom, keterTop, yesodLean),
				this.highlight(bodyWidth, bodyHeight, yesodLean),
				...this.leaves(random, leafCount, leafHeight, leafSpread, keterTop, tiferesVariation)
			]
		};
	}

	/** @returns {object} Tapered root body built from two sampled quadratic sides. */
	static body(width, bottom, top, lean) {
		const gevurahLeft = TiferesPathPoints.quadratic(
			{ x: -width * .48, y: top },
			{ x: -width * .55 + lean, y: bottom * .2 },
			{ x: lean, y: bottom }
		);
		const chesedRight = TiferesPathPoints.quadratic(
			{ x: lean, y: bottom },
			{ x: width * .55 + lean, y: bottom * .2 },
			{ x: width * .48, y: top },
			12,
			'line'
		);
		return {
			type: 'path',
			points: TiferesPathPoints.join(gevurahLeft, chesedRight),
			fill: '#e88737',
			stroke: '#a85b26',
			lineWidth: 3,
			close: true
		};
	}

	/** @returns {object} Soft sampled highlight adding volume without raster texture dependency. */
	static highlight(width, height, lean) {
		return {
			type: 'path',
			points: TiferesPathPoints.quadratic(
				{ x: -width * .18, y: -height * .24 },
				{ x: -width * .3 + lean, y: height * .04 },
				{ x: -width * .12 + lean, y: height * .28 },
				8
			),
			fill: null,
			stroke: 'rgba(255, 214, 155, 0.48)',
			lineWidth: Math.max(2, width * .055),
			lineCap: 'round'
		};
	}

	/** @returns {object[]} Leaf crown with shared species height and bounded local variation. */
	static leaves(random, count, height, spread, topY, variation) {
		return Array.from({ length: count }, (_, hodIndex) => {
			const yesodCenter = (count - 1) / 2;
			const gevurahOffset = hodIndex - yesodCenter;
			return {
				type: 'ellipse',
				x: gevurahOffset * spread * .38,
				y: topY - height * random.range(.32, .52),
				radiusX: spread * random.range(.18, .28),
				radiusY: height * random.range(.42, .58) * (1 + variation * .08),
				rotation: gevurahOffset * .28 + random.range(-.1, .1),
				fill: random.next() < .5 ? '#4b9449' : '#5aa252',
				stroke: '#2f6e35',
				lineWidth: 2
			};
		});
	}
}
