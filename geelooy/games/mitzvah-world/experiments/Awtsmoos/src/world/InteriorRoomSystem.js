// B"H
import { createDoorWallSet } from './DoorWallSystem.js';
import { createMezuzaDef } from './MezuzaSystem.js';
import {
	floorTopY,
	localToWorld,
	storyCeilingY
} from './house/HouseSpec.js';

/** Creates full-height partitions with source-room-right doorway fixtures. */
export function createInteriorRoomSet({ spec, materials }) {
	const staticDefs = [];
	const doorDefs = [];
	const mezuzaDefs = [];
	const debug = [];
	for (let level = 0; level < spec.floors; level += 1) {
		const floorY = floorTopY(spec, level);
		const ceilingY = storyCeilingY(spec, level);
		const partition = createPartition(spec, materials, level, floorY, ceilingY);
		staticDefs.push(partition.wall, partition.mezuza);
		doorDefs.push(partition.door);
		mezuzaDefs.push(partition.mezuza);
		debug.push(partition.debug);
	}
	return { staticDefs, doorDefs, mezuzaDefs, debug };
}

function createPartition(spec, materials, level, floorY, ceilingY) {
	const interiorDepth = spec.depth - spec.wallT * 2;
	const interiorWidth = spec.width - spec.wallT * 2;
	const localX = interiorWidth * 0.17;
	const point = localToWorld(spec, localX, 0);
	const height = ceilingY - floorY;
	const sourceRoomId = `${spec.id}-story-${level + 1}-original-room`;
	const targetRoomId = `${spec.id}-story-${level + 1}-inner-room`;
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
	const mezuza = createMezuzaDef(set.spec, materials.mezuza, {
		doorwayKind: 'interior',
		sourceRoomId,
		targetRoomId
	});
	return {
		...set,
		mezuza,
		debug: partitionDebug(set, height, interiorDepth, sourceRoomId, targetRoomId)
	};
}

function partitionDebug(set, height, interiorDepth, sourceRoomId, targetRoomId) {
	return {
		id: set.wall.id,
		axis: 'depth',
		fullSpan: interiorDepth,
		actualWidth: set.wall.size.x,
		actualHeight: height,
		doorOpening: set.wall.door,
		sourceRoomId,
		targetRoomId,
		mezuzaId: `${set.door.id}-mezuza`,
		touchesLeftBoundary: true,
		touchesRightBoundary: true,
		touchesCeiling: true
	};
}
