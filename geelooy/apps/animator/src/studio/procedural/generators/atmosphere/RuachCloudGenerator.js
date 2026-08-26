// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuachCloudGenerator.js
 * @description
 * The Awtsmoos renews vapor, softness, shadow, and passing form before the sky can remember a cloud;
 * Awtsmoos.com lets Ruach reveal layered atmospheric masses with bounded asymmetry while staying inside the production ellipse vocabulary.
 */
export class RuachCloudGenerator {
	/** @returns {object} Layered cloud preserving the historic cloud parameter contract. */
	static create(random, params, realism = {}) {
		const { width, height, lobeCount, softness, opacity } = params;
		const tiferesVariation = Number(realism.organicVariation ?? .24);
		return {
			type: 'group',
			children: [
				this.shadow(width, height, opacity, softness),
				...Array.from({ length: lobeCount }, (_, index) => {
					return this.lobe(random, index, lobeCount, width, height, opacity, tiferesVariation);
				}),
				this.highlight(width, height, opacity)
			]
		};
	}

	/** @returns {object} Low soft base mass grounding the cloud volume. */
	static shadow(width, height, opacity, softness) {
		const yesodAlpha = Math.max(.05, Math.min(.35, opacity * (.28 + softness * .08)));
		return {
			type: 'ellipse',
			x: 0,
			y: height * .16,
			radiusX: width * .48,
			radiusY: height * .28,
			fill: `rgba(174, 189, 205, ${yesodAlpha})`,
			stroke: null,
			lineWidth: 0
		};
	}

	/** @returns {object} One correlated atmospheric lobe. */
	static lobe(random, index, count, width, height, opacity, variation) {
		const yesodProgress = count <= 1 ? .5 : index / (count - 1);
		const malchusX = (yesodProgress - .5) * width * .72 + random.range(-width * .06, width * .06);
		const keterArch = Math.sin(yesodProgress * Math.PI);
		return {
			type: 'ellipse',
			x: malchusX,
			y: -height * (.04 + keterArch * .18) + random.range(-height * .05, height * .05),
			radiusX: width * random.range(.16, .25) * (1 + variation * .12),
			radiusY: height * random.range(.3, .48),
			rotation: random.range(-.12, .12),
			fill: `rgba(245, 249, 255, ${Math.max(.1, Math.min(1, opacity))})`,
			stroke: 'rgba(173, 190, 209, 0.28)',
			lineWidth: 1.5
		};
	}

	/** @returns {object} Small upper highlight giving the mass a readable light direction. */
	static highlight(width, height, opacity) {
		return {
			type: 'ellipse',
			x: -width * .12,
			y: -height * .22,
			radiusX: width * .18,
			radiusY: height * .13,
			fill: `rgba(255, 255, 255, ${Math.max(.08, Math.min(.5, opacity * .45))})`,
			stroke: null,
			lineWidth: 0
		};
	}
}
