// B"H
import { createStairCollisionRamp } from '../world/house/StairCollisionRamp.js';
import { inspectStairTraversal } from '../world/house/StairTraversalProbe.js';

/** Replays the real generated ramp through the real capsule mover on demand. */
export function inspectStairCollision(runtime, houseId, level = 1) {
	const metadata = runtime.terrain.worldMetadata;
	const house = metadata.houses?.find((item) => item.id === houseId);
	const layout = metadata.stairLayouts?.find((item) => (
		item.houseId === houseId && item.toLevel === level
	));
	if (!house || !layout) {
		return { houseId, level, error: 'stair-collision-not-found' };
	}
	const ramp = createStairCollisionRamp(layout, house);
	return {
		houseId,
		level,
		...inspectStairTraversal(layout, house, ramp),
		verification: 'real-capsule-mover-over-authored-ramp-triangles'
	};
}
