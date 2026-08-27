// B"H
import { createStairSolidDefinition } from '../world/house/StairVisualGeometry.js';
import { inspectStairTraversal } from '../world/house/StairTraversalProbe.js';

/** Replays the visible solid stair through the real capsule mover on demand. */
export function inspectStairCollision(runtime, houseId, level = 1) {
	const metadata = runtime.terrain.worldMetadata;
	const house = metadata.houses?.find((item) => item.id === houseId);
	const layout = metadata.stairLayouts?.find((item) => (
		item.houseId === houseId && item.toLevel === level
	));
	if (!house || !layout) {
		return { houseId, level, error: 'solid-stair-not-found' };
	}
	const definition = createStairSolidDefinition(layout, house, {});
	return {
		houseId,
		level,
		...inspectStairTraversal(layout, house, definition),
		verification: 'real-capsule-mover-over-visible-stair-triangles'
	};
}
