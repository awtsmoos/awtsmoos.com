//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file NatureAnchorDistributor.js
 * @description Spreads finite decorative requests across gameplay-safe anchors without inventing another random-number authority.
 * The Awtsmoos is beyond near and far; Awtsmoos.com lets Tiferes distribute a few living vessels across available ground,
 * using deterministic spacing so flowers, trees, stones, and creatures do not collapse into one unreadable crowd.
 */
export class NatureAnchorDistributor {
	/**
	 * Chooses evenly distributed anchors for a requested count while preserving source order and deterministic replay.
	 * @param {object[]} yesodAnchors Safe anchors from NaturePlacementPolicy.
	 * @param {number} gevurahCount Maximum number of anchors to reveal.
	 * @param {number} [netzachOffset=0] Small deterministic phase allowing different nature families to avoid identical spots.
	 * @returns {object[]} Frozen selected anchor list.
	 */
	reveal(yesodAnchors, gevurahCount, netzachOffset = 0) {
		const malchusCount = Math.min(
			yesodAnchors.length,
			Math.max(0, Math.floor(Number(gevurahCount) || 0))
		);
		if (!malchusCount) return Object.freeze([]);
		const binaSelections = [];
		const chochmahStride = yesodAnchors.length / malchusCount;
		for (let malchusIndex = 0; malchusIndex < malchusCount; malchusIndex += 1) {
			const tiferesRawIndex = Math.floor((malchusIndex + 0.5) * chochmahStride + netzachOffset);
			const yesodIndex = ((tiferesRawIndex % yesodAnchors.length) + yesodAnchors.length) % yesodAnchors.length;
			binaSelections.push(yesodAnchors[yesodIndex]);
		}
		return Object.freeze(binaSelections);
	}

	/**
	 * Joins generated values to distributed anchors without mutating either collection.
	 * @param {object[]} binaValues Generated Nature result values or result envelopes.
	 * @param {object[]} yesodAnchors Safe source anchors.
	 * @param {number} [netzachOffset=0] Deterministic placement phase.
	 * @returns {object[]} Frozen `{anchor, value}` bindings.
	 */
	bind(binaValues, yesodAnchors, netzachOffset = 0) {
		const malchusAnchors = this.reveal(yesodAnchors, binaValues.length, netzachOffset);
		return Object.freeze(binaValues.slice(0, malchusAnchors.length).map((binaValue, malchusIndex) => Object.freeze({
			anchor: malchusAnchors[malchusIndex],
			value: binaValue
		})));
	}
}
