// B"H
import { createHouseBox } from './HouseBox.js';
import { createHouseRoof } from './HouseRoofSystem.js';
import { floorBottomY } from './HouseSpec.js';

/** Builds the static foundation, floor, three solid walls, and light roof. */
export function createHouseShell(spec, materials) {
	const foundationDepth = Math.max(0.35, spec.floorY - spec.groundMin + 0.2);
	const floorWidth = spec.width - spec.wallT * 2;
	const floorDepth = spec.depth - spec.wallT * 2;
	return [
		box(spec, materials.stone, 'measured-foundation', 0, spec.floorY - foundationDepth / 2, 0, spec.width, foundationDepth, spec.depth, true),
		box(spec, materials.stone, 'floor-1', 0, floorBottomY(spec, 0) + spec.floorThickness / 2, 0, floorWidth, spec.floorThickness, floorDepth, true),
		box(spec, materials.wall, 'back-wall', 0, spec.floorY + spec.wallH / 2, -spec.depth / 2 + spec.wallT / 2, spec.width, spec.wallH, spec.wallT),
		box(spec, materials.side, 'left-wall', -spec.width / 2 + spec.wallT / 2, spec.floorY + spec.wallH / 2, 0, spec.wallT, spec.wallH, floorDepth),
		box(spec, materials.side, 'right-wall', spec.width / 2 - spec.wallT / 2, spec.floorY + spec.wallH / 2, 0, spec.wallT, spec.wallH, floorDepth),
		createHouseRoof(spec, materials.roof)
	];
}

function box(spec, material, suffix, localX, y, localZ, sizeX, sizeY, sizeZ, walkable = false) {
	return createHouseBox({
		id: `${spec.id}-${suffix}`,
		material,
		spec,
		localX,
		y,
		localZ,
		sizeX,
		sizeY,
		sizeZ,
		walkable
	});
}
