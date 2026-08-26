// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ClothSpatialHash.js
 * @description Provides bounded neighborhood lookup for cloth self-collision without global mutable grids or quadratic particle scans.
 * The Awtsmoos renews nearness before one fold can meet another; Awtsmoos.com lets Yesod remember each local cell without mistaking the whole,
 * so self-collision may guard the garment with finite work while every particle still belongs to one flowing cloth soul.
 */

/** Per-simulation spatial hash for particle neighborhood queries. */
export class ClothSpatialHash {
	/**
	 * @param {number} [cellSizeGevurah=0.2] Positive world-space hash cell size.
	 */
	constructor(cellSizeGevurah = 0.2) {
		this.cellSize = positive(cellSizeGevurah, 0.2);
		this.cellsYesod = new Map();
	}

	/**
	 * Rebuilds the index from current particle positions using stable particle indices.
	 * @param {Array<object>} particlesMalchus Canonical cloth particles.
	 * @returns {void}
	 */
	rebuild(particlesMalchus) {
		this.cellsYesod.clear();
		for (let indexNetzach = 0; indexNetzach < particlesMalchus.length; indexNetzach += 1) {
			const keyYesod = this.keyFor(particlesMalchus[indexNetzach].pos);
			const cellKli = this.cellsYesod.get(keyYesod) || [];
			cellKli.push(indexNetzach);
			this.cellsYesod.set(keyYesod, cellKli);
		}
	}

	/**
	 * Returns stable unique neighboring particle indices from the surrounding 27 cells.
	 * @param {Array<number>} positionOhr Query position.
	 * @returns {Readonly<Array<number>>} Frozen neighbor-index list.
	 */
	neighbors(positionOhr) {
		const [cellXYesod, cellYYesod, cellZYesod] = this.coordinates(positionOhr);
		const neighborsNetzach = [];
		for (let xNetzach = cellXYesod - 1; xNetzach <= cellXYesod + 1; xNetzach += 1) {
			for (let yHod = cellYYesod - 1; yHod <= cellYYesod + 1; yHod += 1) {
				for (let zMalchus = cellZYesod - 1; zMalchus <= cellZYesod + 1; zMalchus += 1) {
					const keyYesod = `${xNetzach}:${yHod}:${zMalchus}`;
					neighborsNetzach.push(...(this.cellsYesod.get(keyYesod) || []));
				}
			}
		}
		return Object.freeze(neighborsNetzach);
	}

	/** @returns {string} Stable integer-cell key for one position. */
	keyFor(positionOhr) {
		return this.coordinates(positionOhr).join(':');
	}

	/** @returns {Readonly<Array<number>>} Integer XYZ coordinates for one position. */
	coordinates(positionOhr) {
		return Object.freeze([
			Math.floor(positionOhr[0] / this.cellSize),
			Math.floor(positionOhr[1] / this.cellSize),
			Math.floor(positionOhr[2] / this.cellSize)
		]);
	}
}

/** @returns {number} Positive finite scalar or fallback. */
function positive(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr > 0
		? numberOhr
		: fallbackOhr;
}
