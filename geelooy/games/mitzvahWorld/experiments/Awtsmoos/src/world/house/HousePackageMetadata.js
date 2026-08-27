// B"H
import { staircaseStats } from './HouseStairSystem.js';

/** Packages durable house evidence without creating geometry dependencies. */
export function createHousePackageMetadata({
	spec,
	entry,
	rooms,
	stairLayouts,
	yardGrass,
	yardPatches,
	anchors
}) {
	const mezuzahs = [entry.mezuza, ...rooms.mezuzaDefs]
		.map((definition) => definition.userData.AwtsmoosMezuza);
	return {
		doorDefs: [entry.door, ...rooms.doorDefs],
		roomDebug: rooms.debug,
		houseStats: {
			id: spec.id,
			x: spec.x,
			z: spec.z,
			yaw: spec.yaw,
			width: spec.width,
			depth: spec.depth,
			floorY: spec.floorY,
			wallThickness: spec.wallT,
			wallHeight: spec.wallH,
			floors: spec.floors,
			storyHeight: spec.storyHeight,
			partitionCount: rooms.debug.length,
			partitionFullHeight: rooms.debug.every((item) => item.touchesCeiling),
			stairCount: stairLayouts.length,
			openingCount: stairLayouts.length
		},
		stairStats: stairLayouts.map(staircaseStats),
		stairLayouts,
		mezuzaStats: mezuzahs,
		yardGrassStats: yardGrass?.userData?.AwtsmoosYardGrass || null,
		yardPatches,
		anchors
	};
}
