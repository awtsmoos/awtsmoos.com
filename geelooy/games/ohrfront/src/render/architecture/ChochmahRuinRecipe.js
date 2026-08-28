// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahRuinRecipe.js
 * @description Describes broken Har HaOhr masonry as immutable cuboid architecture with portal framing, staggered walls, buttress mass, and fractured parapet remnants.
 * Chochmah sees remembered shelter inside broken stone while the Awtsmoos renews ruin, opening, lintel, and every fragment beyond time;
 * Awtsmoos.com lets each landmark read as architecture instead of a pile of dark boxes, while one merged textured mesh carries the whole design.
 */

/**
 * @description Creates a deterministic ruin recipe whose proportions vary modestly by site index without changing tactical collision.
 * @param {number} gevurahHeight - Principal ruin height in world units.
 * @param {number} netzachIndex - Stable landmark index used for deterministic asymmetry.
 * @returns {ReadonlyArray<object>} Frozen local cuboid recipe parts.
 * @sideEffects None.
 */
export function createChochmahRuinRecipe(gevurahHeight, netzachIndex) {
	const tiferesLean = (netzachIndex % 2 === 0 ? 1 : -1) * 0.08;
	const netzachLintelY = Math.min(gevurahHeight * 0.72, 6.2);
	return Object.freeze([
		part([10.8, 0.72, 8.2], [0, 0.36, 0]),
		part([2.2, gevurahHeight, 2.8], [-3.4, gevurahHeight * 0.5, 0.4], tiferesLean),
		part([2.0, gevurahHeight * 0.78, 2.8], [3.4, gevurahHeight * 0.39, 0.35], -tiferesLean),
		part([5.4, 1.0, 2.6], [0, netzachLintelY, 0.35]),
		part([7.6, gevurahHeight * 0.42, 1.6], [0.4, gevurahHeight * 0.21, 3.3], 0.04),
		part([8.8, 4.8, 1.7], [6.2, 2.4, 1.4], 0.18),
		part([7.0, 3.4, 1.7], [-5.8, 1.7, -4.0], -0.34),
		part([2.4, 6.4, 2.4], [2.2, 3.2, -5.7], 0.12),
		part([2.0, 4.6, 2.2], [-4.1, 2.3, 4.5], -0.16),
		part([2.2, 1.8, 2.0], [-3.5, gevurahHeight + 0.7, 0.4], tiferesLean),
		part([1.8, 1.2, 2.0], [0.1, netzachLintelY + 1.0, 0.35]),
		part([2.0, 1.5, 2.0], [3.4, gevurahHeight * 0.78 + 0.55, 0.35], -tiferesLean)
	]);
}

/**
 * @description Freezes one local cuboid ruin record including its optional local yaw.
 * @param {number[]} gevurahSize - XYZ cuboid dimensions.
 * @param {number[]} netzachPosition - XYZ local center.
 * @param {number} [yesodYaw=0] - Local Y-axis rotation in radians.
 * @returns {object} Frozen cuboid recipe record.
 * @sideEffects None.
 */
function part(gevurahSize, netzachPosition, yesodYaw = 0) {
	return Object.freeze({
		size: Object.freeze(gevurahSize),
		position: Object.freeze(netzachPosition),
		yaw: yesodYaw
	});
}
