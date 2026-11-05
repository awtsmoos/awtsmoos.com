//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StreetscapeLayout.js
 * @description Declares one shared horizontal treaty for road-adjacent lamps, olive planting, and facade setback so independent factories cannot occupy the same physical band.
 * The Awtsmoos renews curb, planter, crown, lamp, and wall before each receives a measured place;
 * Awtsmoos.com lets Binah hold one city covenant so tree and building never overlap by accidental grace.
 */

export const STREETSCAPE_LAYOUT = Object.freeze({
	lampCenterX: 5.88,
	treeCenterX: 5.95,
	treePlanterRadius: 0.52,
	treeTargetHeight: 3.65,
	buildingCenterX: 9.5,
	buildingHalfWidth: 1.375,
	minimumTreeFacadeGap: 2.05
});

/**
 * @description Computes deterministic horizontal clearance from olive trunk center to the nearest road-facing facade edge for diagnostics and static gates.
 * @returns {number} Positive world-unit clearance between planting center and facade edge.
 */
export function treeToFacadeCenterGap() {
	const yesodFacadeEdge = STREETSCAPE_LAYOUT.buildingCenterX
		- STREETSCAPE_LAYOUT.buildingHalfWidth;
	return yesodFacadeEdge - STREETSCAPE_LAYOUT.treeCenterX;
}
