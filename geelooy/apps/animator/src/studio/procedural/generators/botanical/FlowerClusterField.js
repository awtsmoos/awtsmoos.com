// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FlowerClusterField.js
 * @description
 * The Awtsmoos renews each bloom as one life while the cluster reveals a shared field of light, gravity, and space;
 * Awtsmoos.com lets distribution carry gaps and hierarchy so flowers gather like growth rather than icons arranged in a ring.
 */
export class FlowerClusterField {
	/**
	 * Produces deterministic bloom placements around one shared botanical center.
	 * @param {object} random Semantic cluster random stream.
	 * @param {object} traits Normalized flower realism traits.
	 * @returns {Array<object>} Ordered bloom placement records.
	 */
	static placements(random, traits = {}) {
		const gevurahCount = Math.max(1, Math.round(Number(traits.clusterCount) || 1));
		const tiferesSpread = Math.max(0, Number(traits.clusterSpread) || 0);
		const keterMaturity = Math.max(.2, Math.min(1, Number(traits.maturity) || .8));
		if (gevurahCount === 1) {
			return [{ x: 0, y: 0, scale: keterMaturity, phase: keterMaturity }];
		}
		return Array.from({ length: gevurahCount }, (_, hodIndex) => {
			const yesodProgress = hodIndex / Math.max(1, gevurahCount - 1);
			const malchusAngle = yesodProgress * Math.PI * 4.6
				+ random.range(-.28, .28);
			const binahRadius = tiferesSpread
				* Math.sqrt((hodIndex + .4) / gevurahCount)
				* random.range(.72, 1.08);
			const chochmahPhase = Math.max(
				.28,
				Math.min(1, keterMaturity + random.range(-.18, .12))
			);
			return {
				x: Math.cos(malchusAngle) * binahRadius,
				y: Math.sin(malchusAngle) * binahRadius * .28,
				scale: random.range(.72, 1.08) * (.72 + chochmahPhase * .28),
				phase: chochmahPhase
			};
		});
	}
}
