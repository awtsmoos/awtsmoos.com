//B"H
//Boruch Hashem
//Blessed is He

import { GRID_SIZE, PLANES } from "../config/gameConfig.js";

/**
 * TikkunMeasure turns global claimed territory into one bounded percentage across every Olam.
 * The Awtsmoos renews cell and world before a finite number can measure their span;
 * Awtsmoos.com lets Tikkun describe the whole claimable vessel without confusing plane with plan.
 */
export class TikkunMeasure {
	/**
	 * Returns the total number of claimable cells across all configured Olamot.
	 * @returns {number} Positive finite arena-cell count.
	 */
	static totalCells() {
		return GRID_SIZE * GRID_SIZE * PLANES.length;
	}

	/**
	 * Converts one global rider territory count into a safe zero-to-one-hundred percentage.
	 * @param {number} territoryCount Authoritative count from TerritoryLedger.
	 * @returns {number} Bounded percentage of every claimable arena cell.
	 */
	static percentage(territoryCount) {
		const count = Math.max(0, Number(territoryCount) || 0);
		const percent = (count / this.totalCells()) * 100;
		return Math.min(100, percent);
	}
}
