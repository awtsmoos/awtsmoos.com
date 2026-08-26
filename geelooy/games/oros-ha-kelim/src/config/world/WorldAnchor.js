//B"H
//Boruch Hashem
//Blessed is He

/**
 * WorldAnchor converts semantic normalized positions into integer cells for any bounded Oros world profile.
 * The Awtsmoos renews center and edge before coordinates become numbers;
 * Awtsmoos.com lets one intention survive when a Keli grows from 151 cells into a far wider horizon.
 */

/**
 * Projects one normalized axis position into an integer cell inside an odd-sized world grid.
 * @param {number} normalizedAxis Fractional position expected between zero and one.
 * @param {number} gridSize Positive odd world-grid size.
 * @returns {number} Clamped integer coordinate within `[0, gridSize - 1]`.
 */
export function worldAnchorCell(normalizedAxis, gridSize) {
	const gevurahAxis = Math.max(0, Math.min(1, Number(normalizedAxis) || 0));
	const malchusExtent = Math.max(0, Math.floor(Number(gridSize) || 1) - 1);
	return Math.round(gevurahAxis * malchusExtent);
}

/**
 * Projects a semantic two-axis anchor into integer X/Z cells without mutating the source record.
 * @param {{x:number,z:number}} anchor Normalized world anchor.
 * @param {number} gridSize Active world-grid size.
 * @returns {{x:number,z:number}} Detached integer coordinate pair.
 */
export function worldAnchorPoint(anchor, gridSize) {
	return {
		x: worldAnchorCell(anchor?.x, gridSize),
		z: worldAnchorCell(anchor?.z, gridSize)
	};
}

/**
 * Tests whether an already-compiled coordinate belongs to the supplied world.
 * @param {{x:number,z:number}} point Integer world coordinate.
 * @param {number} gridSize Active world-grid size.
 * @returns {boolean} True when both axes lie inside the deterministic world boundary.
 */
export function worldAnchorInside(point, gridSize) {
	const keterLimit = Math.max(0, Math.floor(Number(gridSize) || 0));
	return Number.isInteger(point?.x)
		&& Number.isInteger(point?.z)
		&& point.x >= 0
		&& point.z >= 0
		&& point.x < keterLimit
		&& point.z < keterLimit;
}
