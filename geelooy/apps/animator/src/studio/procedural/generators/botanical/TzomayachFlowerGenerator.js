// B"H
// Boruch Hashem
// Blessed is He

import { TiferesPathPoints } from '../geometry/TiferesPathPoints.js';

/**
 * @file TzomayachFlowerGenerator.js
 * @description
 * The Awtsmoos renews every petal before symmetry learns to bend and every stem before gravity finds its thread;
 * Awtsmoos.com lets one species identity breathe through bounded imperfection, sampled stem curvature, leaf, and golden head.
 */
export class TzomayachFlowerGenerator {
	/** @returns {object} Editable flower preserving the historic five flower parameters. */
	static create(random, params, realism = {}) {
		const { petalCount, petalOrbit, petalWidth, petalHeight, stemHeight } = params;
		const tiferesVariation = Number(realism.organicVariation ?? .28);
		const keterCenterY = -stemHeight * .7;
		return {
			type: 'group',
			children: [
				this.stem(keterCenterY, random),
				this.leaf(stemHeight, random),
				...this.petals(random, petalCount, petalOrbit, petalWidth, petalHeight, keterCenterY, tiferesVariation),
				this.center(keterCenterY)
			]
		};
	}

	/** @returns {object} Sampled curved stem using the production path-point vocabulary. */
	static stem(centerY, random) {
		const binahBend = random.range(-14, 14);
		return {
			type: 'path',
			points: TiferesPathPoints.quadratic(
				{ x: 0, y: 0 },
				{ x: binahBend, y: centerY * .5 },
				{ x: 0, y: centerY + 8 }
			),
			fill: null,
			stroke: '#3f7f3c',
			lineWidth: 7,
			lineCap: 'round'
		};
	}

	/** @returns {object} One angled leaf giving the stem a readable botanical silhouette. */
	static leaf(stemHeight, random) {
		const yesodSide = random.next() < .5 ? -1 : 1;
		return {
			type: 'ellipse',
			x: yesodSide * 13,
			y: -stemHeight * .34,
			radiusX: 10,
			radiusY: 25,
			rotation: yesodSide * .7,
			fill: '#4c9347',
			stroke: '#2d6c31',
			lineWidth: 2
		};
	}

	/** @returns {object[]} Layered petals with correlated but bounded organic variation. */
	static petals(random, count, orbit, width, height, centerY, variation) {
		const tiferesColors = ['#f472b6', '#fb82bc', '#ff9ac8', '#e965aa'];
		return Array.from({ length: count }, (_, hodIndex) => {
			const yesodAngle = (Math.PI * 2 * hodIndex) / count + random.range(-.045, .045) * variation;
			const gevurahScale = random.range(1 - variation * .22, 1 + variation * .22);
			return {
				type: 'ellipse',
				x: Math.cos(yesodAngle) * orbit,
				y: centerY + Math.sin(yesodAngle) * orbit,
				radiusX: width * gevurahScale,
				radiusY: height * random.range(.92, 1.08),
				rotation: yesodAngle,
				fill: tiferesColors[random.integer(0, tiferesColors.length - 1)],
				stroke: '#ad4b7f',
				lineWidth: 2
			};
		});
	}

	/** @returns {object} Golden flower center. */
	static center(centerY) {
		return { type: 'circle', x: 0, y: centerY, radius: 18, fill: '#e9b83f', stroke: '#9f7424', lineWidth: 2 };
	}
}
