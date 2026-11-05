// B"H
import { createHouseBox } from './house/HouseBox.js';
import { floorBottomY } from './house/HouseSpec.js';
import { planHouseStaircase } from './house/HouseStairSystem.js';

export function stairwellOpening(specification, level) {
	return planHouseStaircase(specification, level - 1, level).opening;
}

/** Creates four bands around the exact opening shared with the staircase. */
export function createStoryFloorPieces({ spec, material, level }) {
	const width = spec.width - spec.wallT * 2;
	const depth = spec.depth - spec.wallT * 2;
	const opening = stairwellOpening(spec, level);
	const y = floorBottomY(spec, level) + spec.floorThickness / 2;
	return floorBands({ spec, material, level, width, depth, opening, y })
		.filter((definition) => definition.size.x > 0.08 && definition.size.z > 0.08);
}

function floorBands({ spec, material, level, width, depth, opening, y }) {
	const leftWidth = opening.xMin + width / 2;
	const rightWidth = width / 2 - opening.xMax;
	const frontDepth = depth / 2 - opening.zMax;
	const backDepth = opening.zMin + depth / 2;
	return [
		piece(spec, material, level, 'left', -width / 2 + leftWidth / 2, 0, leftWidth, depth, y),
		piece(spec, material, level, 'right', opening.xMax + rightWidth / 2, 0, rightWidth, depth, y),
		piece(spec, material, level, 'front', opening.centerX, opening.zMax + frontDepth / 2, opening.width, frontDepth, y),
		piece(spec, material, level, 'back', opening.centerX, -depth / 2 + backDepth / 2, opening.width, backDepth, y)
	];
}

function piece(spec, material, level, suffix, localX, localZ, sizeX, sizeZ, y) {
	return createHouseBox({
		id: `${spec.id}-story-${level + 1}-${suffix}`,
		material,
		spec,
		localX,
		y,
		localZ,
		sizeX,
		sizeY: spec.floorThickness,
		sizeZ,
		walkable: true,
		userData: { AwtsmoosFloorOpeningLevel: level }
	});
}
