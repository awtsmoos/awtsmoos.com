// B"H
import { createDoorWallSet } from './DoorWallSystem.js';
import {
	floorTopY,
	localToWorld,
	storyCeilingY
} from './house/HouseSpec.js';

/** Creates full-height depth partitions with true boolean doorway subtraction. */
export function createInteriorRoomSet({ spec, materials }) {
	const staticDefs = [];
	const doorDefs = [];
	const debug = [];
	for (let level = 0; level < spec.floors; level += 1) {
		const floorY = floorTopY(spec, level);
		const ceilingY = storyCeilingY(spec, level);
		const partition = createPartition(spec, materials, level, floorY, ceilingY);
		staticDefs.push(partition.wall);
		doorDefs.push(partition.door);
		debug.push(partition.debug);
	}
	return { staticDefs, doorDefs, debug };
}

function createPartition(spec, materials, level, floorY, ceilingY) {
	const interiorDepth = spec.depth - spec.wallT * 2;
	const interiorWidth = spec.width - spec.wallT * 2;
	const localX = interiorWidth * 0.17;
	const point = localToWorld(spec, localX, 0);
	const height = ceilingY - floorY;
	const set = createDoorWallSet({
		id: `${spec.id}-partition-${level + 1}`,
		houseId: spec.id,
		wallId: `${spec.id}-partition-${level + 1}-wall`,
		doorId: `${spec.id}-partition-${level + 1}-door`,
		x: point.x,
		z: point.z,
		floorY,
		openingBottomY: floorY,
		yaw: spec.yaw + Math.PI / 2,
		wallW: interiorDepth,
		wallH: height,
		wallT: Math.max(0.48, spec.wallT * 0.65),
		doorW: Math.max(2.6, spec.doorW * 0.88),
		doorH: spec.doorH,
		doorThickness: 0.2,
		openAngle: -Math.PI * 0.5,
		noEdge: true
	}, {
		...materials.wall,
		doorMaterial: materials.door
	});
	return {
		...set,
		debug: {
			id: set.wall.id,
			axis: 'depth',
			fullSpan: interiorDepth,
			actualWidth: set.wall.size.x,
			actualHeight: height,
			doorOpening: set.wall.door,
			touchesLeftBoundary: true,
			touchesRightBoundary: true,
			touchesCeiling: set.spec.center.y + set.spec.wall.height === ceilingY
		}
	};
}
