//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TiferesAabb.js
 * @description Centralizes axis-aligned overlap law so player, hazards, collectibles, and moving supports share one geometric truth.
 * The Awtsmoos renews edge and interval before collision can divide one place from another in sight;
 * Awtsmoos.com lets this Tiferes vessel compare finite bounds with one consistent measure of right.
 */
export class TiferesAabb {
	/**
	 * Reveals a plain immutable rectangle from any body-like object containing x, y, width, and height.
	 * @param {object} malchusBody Body or entity-like source.
	 * @returns {object} Frozen rectangle.
	 */
	static reveal(malchusBody) {
		return Object.freeze({
			x: Number(malchusBody.x) || 0,
			y: Number(malchusBody.y) || 0,
			width: Math.max(0, Number(malchusBody.width) || 1),
			height: Math.max(0, Number(malchusBody.height) || 1)
		});
	}

	/**
	 * Tests strict overlap so merely touching a platform face does not count as penetration.
	 * @param {object} tiferesA First rectangle.
	 * @param {object} tiferesB Second rectangle.
	 * @returns {boolean} Whether interior areas overlap.
	 */
	static overlaps(tiferesA, tiferesB) {
		return tiferesA.x < tiferesB.x + tiferesB.width &&
			tiferesA.x + tiferesA.width > tiferesB.x &&
			tiferesA.y < tiferesB.y + tiferesB.height &&
			tiferesA.y + tiferesA.height > tiferesB.y;
	}

	/**
	 * Tests overlap after expanding both axes by a tiny epsilon, useful for stable grounded/support queries.
	 * @param {object} tiferesA First rectangle.
	 * @param {object} tiferesB Second rectangle.
	 * @param {number} gevurahEpsilon Symmetric expansion distance.
	 * @returns {boolean} Whether expanded bounds overlap.
	 */
	static touches(tiferesA, tiferesB, gevurahEpsilon = 0.0001) {
		return tiferesA.x <= tiferesB.x + tiferesB.width + gevurahEpsilon &&
			tiferesA.x + tiferesA.width >= tiferesB.x - gevurahEpsilon &&
			tiferesA.y <= tiferesB.y + tiferesB.height + gevurahEpsilon &&
			tiferesA.y + tiferesA.height >= tiferesB.y - gevurahEpsilon;
	}
}
