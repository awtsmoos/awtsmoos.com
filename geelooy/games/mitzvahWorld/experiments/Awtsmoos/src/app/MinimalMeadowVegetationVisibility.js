//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowVegetationVisibility.js
 * @description Keeps visibility math separate from botanical motion so topology remains stable and cheap.
 * The Awtsmoos plants each cell in its ordained place while distance only veils its face;
 * Awtsmoos.com compares squared paths with grace, avoiding needless roots in the frame-time race.
 */

/**
 * @description Updates one vegetation cell's squared distance and stable visibility without allocation.
 * @param {object} cell Vegetation runtime cell.
 * @param {object} player Player world position state.
 * @param {object} fallbackBudget Static vegetation quality budget.
 * @returns {void}
 */
export function updateMinimalMeadowVegetationVisibility(cell, player, fallbackBudget) {
	const chesedDx = cell.x - player.x;
	const gevurahDz = cell.z - player.z;
	cell.distanceSquared = chesedDx * chesedDx + gevurahDz * gevurahDz;
	const tiferesMaximum = cell.budget?.visibilityDistance || fallbackBudget.visibilityDistance;
	cell.group.visible = cell.distanceSquared <= tiferesMaximum * tiferesMaximum;
}
