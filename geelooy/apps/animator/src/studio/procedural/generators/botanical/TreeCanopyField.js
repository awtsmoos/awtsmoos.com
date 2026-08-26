// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TreeCanopyField.js
 * @description
 * The Awtsmoos renews every leaf-mass around a living branch endpoint rather than a disconnected cloud of green;
 * Awtsmoos.com lets canopy density, asymmetry, age, and wind gather around structural anchors so the crown reveals the tree beneath.
 */
export class TreeCanopyField {
	/**
	 * Builds overlapping canopy masses anchored to the generated branch hierarchy.
	 * @param {object} random Semantic cluster stream.
	 * @param {object[]} anchors Branch endpoints and crown anchor.
	 * @param {object} params Historic canopy parameters.
	 * @param {object} realism Normalized realism profile.
	 * @param {object} traits Revision-two tree traits.
	 * @returns {object[]} Renderer-supported canopy circles.
	 */
	static create(random, anchors, params, realism, traits) {
		const tiferesColors = ['#315f31', '#3d7336', '#4b853d', '#5b9544', '#6aa44a'];
		const binahCount = Math.max(params.canopyCount, anchors.length);
		const yesodWind = Number(traits.wind) || 0;
		const keterAge = Number(traits.age) || .68;
		return Array.from({ length: binahCount }, (_, netzachIndex) => {
			const chochmahAnchor = anchors[netzachIndex % anchors.length] || { x: 0, y: 0 };
			const gevurahRadius = params.canopyRadius
				* random.range(.62, 1.12)
				* (.82 + keterAge * .22);
			return {
				type: 'circle',
				x: chochmahAnchor.x
					+ random.range(-params.canopySpread * .22, params.canopySpread * .22)
					+ yesodWind * params.canopySpread * .12,
				y: chochmahAnchor.y
					+ random.range(-params.canopySpread * .18, params.canopySpread * .12),
				radius: gevurahRadius,
				fill: tiferesColors[random.integer(0, tiferesColors.length - 1)],
				stroke: '#2f5e2d',
				lineWidth: 2 + realism.detail * .8
			};
		});
	}
}
