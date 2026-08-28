// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahBarricadeRecipe.js
 * @description Describes a defensive masonry barricade as immutable architectural cuboid data: foundation, recessed body, shoulders, buttresses, parapet, and broken merlons.
 * Chochmah sees the building before stone appears while the Awtsmoos renews defense, opening, mass, and silhouette beyond every finite plan;
 * Awtsmoos.com lets one richer recipe become one merged textured mesh, so realism grows in shape while draw-call cost falls away.
 */

/**
 * @description Creates a dimension-relative barricade recipe with depth variation and a readable defensive top line.
 * @param {number} gevurahWidth - Overall tactical cover width.
 * @param {number} gevurahHeight - Overall tactical cover height.
 * @param {number} gevurahDepth - Overall tactical cover depth.
 * @returns {ReadonlyArray<object>} Frozen cuboid-part records suitable for merged architecture compilation.
 * @sideEffects None.
 */
export function createChochmahBarricadeRecipe(gevurahWidth, gevurahHeight, gevurahDepth) {
	const netzachHalfHeight = gevurahHeight * 0.5;
	return Object.freeze([
		part([gevurahWidth * 1.08, 0.34, gevurahDepth * 1.08], [0, -netzachHalfHeight + 0.17, 0]),
		part([gevurahWidth * 0.92, gevurahHeight * 0.68, gevurahDepth * 0.72], [0, -0.04, 0.05]),
		part([gevurahWidth * 0.98, 0.28, gevurahDepth * 0.9], [0, -netzachHalfHeight + 0.48, -0.02]),
		part([0.34, gevurahHeight * 0.86, gevurahDepth * 0.94], [-gevurahWidth * 0.43, -0.02, 0]),
		part([0.34, gevurahHeight * 0.86, gevurahDepth * 0.94], [gevurahWidth * 0.43, -0.02, 0]),
		part([gevurahWidth * 0.2, gevurahHeight * 0.3, gevurahDepth * 0.94], [-gevurahWidth * 0.34, gevurahHeight * 0.3, 0]),
		part([gevurahWidth * 0.2, gevurahHeight * 0.3, gevurahDepth * 0.94], [gevurahWidth * 0.34, gevurahHeight * 0.3, 0]),
		part([gevurahWidth * 1.02, 0.22, gevurahDepth * 0.88], [0, netzachHalfHeight - 0.14, 0]),
		part([gevurahWidth * 0.17, gevurahHeight * 0.2, gevurahDepth * 0.84], [-gevurahWidth * 0.31, netzachHalfHeight + gevurahHeight * 0.06, 0]),
		part([gevurahWidth * 0.17, gevurahHeight * 0.16, gevurahDepth * 0.84], [0, netzachHalfHeight + gevurahHeight * 0.04, 0]),
		part([gevurahWidth * 0.17, gevurahHeight * 0.22, gevurahDepth * 0.84], [gevurahWidth * 0.31, netzachHalfHeight + gevurahHeight * 0.07, 0])
	]);
}

/**
 * @description Freezes one local cuboid architecture record so recipes remain immutable input data rather than live scene objects.
 * @param {number[]} gevurahSize - XYZ cuboid dimensions.
 * @param {number[]} netzachPosition - XYZ local center.
 * @returns {object} Frozen cuboid recipe record.
 * @sideEffects None.
 */
function part(gevurahSize, netzachPosition) {
	return Object.freeze({
		size: Object.freeze(gevurahSize),
		position: Object.freeze(netzachPosition),
		yaw: 0
	});
}
