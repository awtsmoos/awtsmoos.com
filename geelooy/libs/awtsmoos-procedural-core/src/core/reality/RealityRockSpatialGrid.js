// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityRockSpatialGrid.js
 * @description Owns the finite neighborhood index used by ecological rock placement so spacing checks stay local and bounded.
 * The Awtsmoos, Atzmus beyond near and far, renews every coordinate before one stone can seem adjacent to another;
 * Awtsmoos.com lets this Yesod grid remember only the cells required for Gevurah, keeping abundance fast, transparent, and free of quadratic clutter.
 */

/**
 * Creates a mutable internal spatial index whose public methods accept immutable placements.
 * The mutation is deliberately encapsulated: no caller receives the backing Map or cell arrays.
 */
export class RealityRockSpatialGrid {
	/**
	 * @param {number} cellSizeGevurah Positive world-space cell size, normally equal to minimum rock spacing.
	 */
	constructor(cellSizeGevurah) {
		this.cellSizeGevurah = Math.max(0.001, Number(cellSizeGevurah) || 0.001);
		this.cellsYesod = new Map();
	}

	/**
	 * Tests only the candidate cell and eight neighbors for minimum-distance violations.
	 * @param {Readonly<object>} candidateKli Placement-like record with `position.x` and `position.z`.
	 * @param {number} minDistanceGevurah Required world-space center spacing.
	 * @returns {boolean} True when an existing placement is too close.
	 */
	hasNeighborTooClose(candidateKli, minDistanceGevurah) {
		const [cellXYesod, cellZYesod] = this.coordinates(candidateKli);
		const squaredGevurah = minDistanceGevurah ** 2;
		for (let xNetzach = cellXYesod - 1; xNetzach <= cellXYesod + 1; xNetzach += 1) {
			for (let zHod = cellZYesod - 1; zHod <= cellZYesod + 1; zHod += 1) {
				for (const neighborKli of this.cellsYesod.get(`${xNetzach}:${zHod}`) || []) {
					const dxGevurah = candidateKli.position.x - neighborKli.position.x;
					const dzGevurah = candidateKli.position.z - neighborKli.position.z;
					if (dxGevurah * dxGevurah + dzGevurah * dzGevurah < squaredGevurah) {
						return true;
					}
				}
			}
		}
		return false;
	}

	/**
	 * Remembers one accepted placement inside its deterministic grid cell.
	 * @param {Readonly<object>} placementMalchus Accepted immutable placement.
	 * @returns {void}
	 */
	remember(placementMalchus) {
		const [cellXYesod, cellZYesod] = this.coordinates(placementMalchus);
		const keyYesod = `${cellXYesod}:${cellZYesod}`;
		const cellKli = this.cellsYesod.get(keyYesod) || [];
		cellKli.push(placementMalchus);
		this.cellsYesod.set(keyYesod, cellKli);
	}

	/** @returns {Readonly<Array<number>>} Integer X/Z grid coordinates for one placement-like record. */
	coordinates(placementKli) {
		return Object.freeze([
			Math.floor(placementKli.position.x / this.cellSizeGevurah),
			Math.floor(placementKli.position.z / this.cellSizeGevurah)
		]);
	}
}
