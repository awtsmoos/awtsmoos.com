// B"H
// Boruch Hashem
// Blessed is He

import { TiferesPathPoints } from '../geometry/TiferesPathPoints.js';

/**
 * @file FlowerBloomBuilder.js
 * @description
 * The Awtsmoos renews stem, leaf, petal, and center before one bloom can appear to unfold from itself;
 * Awtsmoos.com keeps anatomy local and reusable so one flower and a whole meadow cluster share the same living grammar.
 */
export class FlowerBloomBuilder {
	/**
	 * Builds one complete bloom at an explicit cluster placement.
	 * @param {object} random Semantic structure stream.
	 * @param {object} params Historic flower geometry parameters.
	 * @param {object} realism Normalized realism profile.
	 * @param {object} placement Cluster x/y/scale/phase record.
	 * @returns {object[]} Renderer-supported bloom children.
	 */
	static create(random, params, realism, placement) {
		const tiferesScale = Number(placement.scale) || 1;
		const keterPhase = Number(placement.phase) || 1;
		const yesodStemHeight = params.stemHeight * tiferesScale;
		const malchusCenterY = placement.y - yesodStemHeight * .7;
		return [
			this.stem(random, placement.x, placement.y, malchusCenterY, tiferesScale),
			this.leaf(random, placement.x, placement.y, yesodStemHeight, tiferesScale),
			...this.petals(
				random,
				params,
				realism,
				placement.x,
				malchusCenterY,
				tiferesScale,
				keterPhase
			),
			this.center(placement.x, malchusCenterY, tiferesScale, keterPhase)
		];
	}

	/** @returns {object} Curved cluster-aware stem path. */
	static stem(random, x, baseY, centerY, scale) {
		const binahBend = random.range(-16, 16) * scale;
		return {
			type: 'path',
			points: TiferesPathPoints.quadratic(
				{ x, y: baseY },
				{ x: x + binahBend, y: baseY + (centerY - baseY) * .52 },
				{ x, y: centerY + 8 * scale }
			),
			fill: null,
			stroke: '#3f7f3c',
			lineWidth: Math.max(3, 7 * scale),
			lineCap: 'round'
		};
	}

	/** @returns {object} One leaf aligned to the bloom's local stem. */
	static leaf(random, x, baseY, stemHeight, scale) {
		const yesodSide = random.next() < .5 ? -1 : 1;
		return {
			type: 'ellipse',
			x: x + yesodSide * 13 * scale,
			y: baseY - stemHeight * .34,
			radiusX: 10 * scale,
			radiusY: 25 * scale,
			rotation: yesodSide * .7,
			fill: '#4c9347',
			stroke: '#2d6c31',
			lineWidth: Math.max(1, 2 * scale)
		};
	}

	/** @returns {object[]} Anatomically related petals with maturity-aware opening. */
	static petals(random, params, realism, x, centerY, scale, phase) {
		const tiferesColors = ['#f472b6', '#fb82bc', '#ff9ac8', '#e965aa'];
		const binahVariation = Number(realism.organicVariation ?? .28);
		const yesodOrbit = params.petalOrbit * scale * (.68 + phase * .32);
		return Array.from({ length: params.petalCount }, (_, hodIndex) => {
			const malchusAngle = Math.PI * 2 * hodIndex / params.petalCount
				+ random.range(-.05, .05) * binahVariation;
			const gevurahScale = random.range(
				1 - binahVariation * .2,
				1 + binahVariation * .2
			);
			return {
				type: 'ellipse',
				x: x + Math.cos(malchusAngle) * yesodOrbit,
				y: centerY + Math.sin(malchusAngle) * yesodOrbit,
				radiusX: params.petalWidth * scale * gevurahScale,
				radiusY: params.petalHeight * scale * random.range(.9, 1.08) * phase,
				rotation: malchusAngle,
				fill: tiferesColors[random.integer(0, tiferesColors.length - 1)],
				stroke: '#ad4b7f',
				lineWidth: Math.max(1, 2 * scale)
			};
		});
	}

	/** @returns {object} Maturity-aware flower center. */
	static center(x, y, scale, phase) {
		return {
			type: 'circle',
			x,
			y,
			radius: 18 * scale * (.72 + phase * .28),
			fill: '#e9b83f',
			stroke: '#9f7424',
			lineWidth: Math.max(1, 2 * scale)
		};
	}
}
