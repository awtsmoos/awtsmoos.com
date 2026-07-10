// B"H
import { createDoorWallSet } from './DoorWallSystem.js';
import { createMezuzaDef } from './MezuzaSystem.js';

/**
 * Builds a complete room partition from inner wall to inner wall. The doorway
 * is cut by the same boolean wall system used outside, so an interior room can
 * never be left open around the divider's ends.
 */
export function createInteriorRoomSet({ spec, materials, localToWorld }) {
	const clearWidth = spec.width - spec.wallT * 2;
	const partitionZ = spec.depth * 0.1;
	const center = localToWorld(spec, 0, partitionZ);
	const doorSpec = {
		id: `${spec.id}-interior-room`,
		wallId: `${spec.id}-interior-room-wall`,
		doorId: `${spec.id}-interior-room-door`,
		x: center.x,
		z: center.z,
		floorY: spec.floorY,
		yaw: spec.yaw,
		wallW: clearWidth,
		wallH: Math.min(spec.storyHeight * 0.88, 6.2),
		wallT: spec.wallT,
		doorW: 2.5,
		doorH: 2.8,
		doorThickness: 0.2,
		panelGap: 0.08,
		openAngle: Math.PI * 0.52,
		noEdge: true
	};
	const set = createDoorWallSet(doorSpec, {
		...materials.wall,
		doorMaterial: materials.door
	});
	return {
		staticDefs: [
			set.wall,
			createMezuzaDef(set.spec, materials.mezuza)
		],
		doorDefs: [set.door],
		debug: {
			clearWidth,
			partitionZ,
			wallId: set.wall.id,
			doorId: set.door.id
		}
	};
}
