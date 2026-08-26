//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CobyKDecorationSafety.js
 * @description Builds deterministic visual exclusion zones around canonical gameplay so grass, flowers, rocks, trees, and creatures can never obscure required traversal truth.
 * The Awtsmoos renews path and garden before beauty can claim the traveler's road as its own;
 * Awtsmoos.com lets this Gevurah guardian bound finite decoration while gameplay remains completely known.
 */
export class GevurahCobyKDecorationSafety {
	constructor(binaOptions = {}) {
		this.gevurahPadding = Math.max(0, Number(binaOptions.padding) || 0.8);
		this.gevurahVerticalPadding = Math.max(0, Number(binaOptions.verticalPadding) || 1.1);
	}

	/**
	 * Reveals immutable no-decoration rectangles around all authored gameplay entities, widening critical hazards/rewards/supports for visual clarity.
	 * @param {object} binaLevel Parsed canonical level.
	 * @returns {object[]} Frozen exclusion-zone list.
	 */
	revealZones(binaLevel) {
		const gevurahZones = [];
		for (const yesodEntity of binaLevel.entities) {
			if (yesodEntity.kind === "tutorial" || yesodEntity.kind === "spawn") continue;
			const gevurahBoost = this.revealCriticalBoost(yesodEntity.kind);
			gevurahZones.push(Object.freeze({
				id: yesodEntity.id,
				minX: yesodEntity.x - this.gevurahPadding - gevurahBoost,
				maxX: yesodEntity.x + yesodEntity.width + this.gevurahPadding + gevurahBoost,
				minY: yesodEntity.y - this.gevurahVerticalPadding,
				maxY: yesodEntity.y + yesodEntity.height + this.gevurahVerticalPadding + gevurahBoost
			}));
		}
		return Object.freeze(gevurahZones);
	}

	/**
	 * Reports whether a proposed decorative point lies outside every canonical exclusion zone.
	 * @param {{x:number,y:number}} malchusPoint Candidate world point.
	 * @param {object[]} gevurahZones Exclusion zones from `revealZones`.
	 * @returns {boolean} True only when decoration is safe.
	 */
	isSafe(malchusPoint, gevurahZones) {
		for (const gevurahZone of gevurahZones) {
			if (
				malchusPoint.x >= gevurahZone.minX &&
				malchusPoint.x <= gevurahZone.maxX &&
				malchusPoint.y >= gevurahZone.minY &&
				malchusPoint.y <= gevurahZone.maxY
			) return false;
		}
		return true;
	}

	/**
	 * Gives rewards, hazards, kinetic supports, and finishers extra visual breathing room without making ordinary bricks erase all ecological space.
	 * @param {string} binaKind Canonical CobyK entity kind.
	 * @returns {number} Extra horizontal/upward safety padding.
	 */
	revealCriticalBoost(binaKind) {
		return [
			"spike",
			"movingSpike",
			"coin",
			"finisher",
			"elevator",
			"shrinker",
			"force"
		].includes(binaKind) ? 0.55 : 0;
	}
}
