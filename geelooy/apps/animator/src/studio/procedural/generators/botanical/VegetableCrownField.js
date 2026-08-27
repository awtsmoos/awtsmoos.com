// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetableCrownField.js
 * @description
 * The Awtsmoos renews leaf from crown while maturity and fan direction remain one botanical cause rather than unrelated ornaments;
 * Awtsmoos.com lets a root carry a coherent living crown whose spread can deepen without altering the proven body geometry beneath the form.
 */
export class VegetableCrownField {
	/**
	 * Builds maturity-aware crown leaves from a dedicated cluster stream.
	 * @param {object} random Semantic cluster stream.
	 * @param {object} params Historic vegetable parameters.
	 * @param {object} traits Revision-two vegetable traits.
	 * @returns {object[]} Renderer-supported crown ellipses.
	 */
	static create(random, params, traits) {
		const tiferesMaturity = Math.max(.2, Math.min(1, Number(traits.maturity) || .8));
		const yesodFan = Math.max(.2, Math.min(1, Number(traits.crownFan) || .65));
		const gevurahCount = Math.max(3, Math.round(3 + tiferesMaturity * 4));
		return Array.from({ length: gevurahCount }, (_, netzachIndex) => {
			const binahProgress = gevurahCount <= 1
				? .5
				: netzachIndex / (gevurahCount - 1);
			const malchusAngle = (binahProgress - .5)
				* Math.PI
				* (.22 + yesodFan * .42);
			const keterScale = random.range(.82, 1.12)
				* (.78 + tiferesMaturity * .28);
			return {
				type: 'ellipse',
				x: Math.sin(malchusAngle) * params.bodyWidth * .18,
				y: -params.bodyHeight * .48
					- Math.cos(malchusAngle) * params.leafLength * .12,
				radiusX: params.bodyWidth * .08 * keterScale,
				radiusY: params.leafLength * .32 * keterScale,
				rotation: malchusAngle + random.range(-.06, .06),
				fill: random.next() < .5 ? '#5f9d48' : '#70aa50',
				stroke: '#3c7938',
				lineWidth: 1.5
			};
		});
	}
}
