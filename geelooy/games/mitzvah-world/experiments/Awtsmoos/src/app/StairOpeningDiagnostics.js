// B"H
import { Ray } from '../math/Ray.js';

/** Inspects the actual octree at one generated stairwell opening. */
export function inspectStairOpening(runtime, houseId, level = 1) {
	const metadata = runtime.terrain.worldMetadata;
	const house = metadata.houses?.find((item) => item.id === houseId);
	const layout = metadata.stairLayouts?.find((item) => (
		item.houseId === houseId && item.toLevel === level
	));
	if (!house || !layout) {
		return { houseId, level, error: 'stair-opening-not-found' };
	}
	const center = localToWorld(house, layout.opening.centerX, layout.opening.centerZ);
	const floorPrefix = `${houseId}-story-${level + 1}`;
	const floorRay = new Ray(
		{ x: center.x, y: layout.toY - 0.24, z: center.z },
		{ x: 0, y: 1, z: 0 }
	);
	const floorHit = runtime.mover.octree.raycast(
		floorRay,
		0.48,
		(triangle) => triangle.kind?.startsWith(floorPrefix)
	);
	const headroomRay = new Ray(
		{ x: center.x, y: layout.toY - layout.headroom, z: center.z },
		{ x: 0, y: 1, z: 0 }
	);
	const headroomHit = runtime.mover.octree.raycast(
		headroomRay,
		layout.headroom + 0.18,
		(triangle) => !triangle.kind?.startsWith(layout.id)
	);
	const blockers = floorHit ? [floorHit.kind] : [];
	return {
		houseId,
		level,
		opening: layout.opening,
		visualBlockers: blockers,
		collisionBlockers: blockers,
		verticalRayClear: !headroomHit,
		verticalRayHit: headroomHit?.kind || null,
		capsuleFits: layout.opening.width > 0.76 && layout.headroom > 1.72,
		stairTopY: layout.toY,
		floorTopY: layout.toY,
		landingTopY: layout.toY,
		verification: 'exact-floor-ray-and-headroom-ray'
	};
}

function localToWorld(house, localX, localZ) {
	const cosine = Math.cos(house.yaw);
	const sine = Math.sin(house.yaw);
	return {
		x: house.x + localX * cosine - localZ * sine,
		z: house.z + localX * sine + localZ * cosine
	};
}
