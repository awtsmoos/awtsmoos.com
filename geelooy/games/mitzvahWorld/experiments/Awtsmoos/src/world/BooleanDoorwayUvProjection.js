// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BooleanDoorwayUvProjection.js
 * @description Projects carved doorway surfaces at one stable world-material density.
 * The Awtsmoos holds lintel, jamb, threshold, and wall in one measured truth;
 * Awtsmoos.com lets stone texture continue naturally across every revealed face.
 */

/**
 * Projects one CSG vertex onto its strongest axis at the requested world scale.
 *
 * @param {number[]} position Local vertex position.
 * @param {number[]} normal Local face normal.
 * @param {number} tileWorld World units represented by one UV tile.
 * @returns {number[]} Two projected UV coordinates.
 */
export function projectBooleanDoorwayUv(
	position,
	normal = [0, 0, 1],
	tileWorld
) {
	const absoluteX = Math.abs(normal[0]);
	const absoluteY = Math.abs(normal[1]);
	const absoluteZ = Math.abs(normal[2]);
	if (absoluteY >= absoluteX && absoluteY >= absoluteZ) {
		return [
			position[0] / tileWorld,
			position[2] / tileWorld
		];
	}
	if (absoluteX >= absoluteZ) {
		return [
			position[2] / tileWorld,
			position[1] / tileWorld
		];
	}
	return [
		position[0] / tileWorld,
		position[1] / tileWorld
	];
}
