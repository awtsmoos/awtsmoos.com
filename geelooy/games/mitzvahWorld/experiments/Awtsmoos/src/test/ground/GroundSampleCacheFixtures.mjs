// B"H
import { WorldGround } from '../../world/WorldGround.js';

/** Creates a deterministic ground with observable terrain and octree work. */
export function createGroundSampleFixture() {
	const counts = {
		terrain: 0,
		rays: 0
	};
	const terrainHeightAt = (x, z) => {
		counts.terrain += 1;
		return 1 + x * 0.02 + z * 0.01;
	};
	const octree = createFloorOctree(counts, 3, 'fixture-floor');
	const ground = new WorldGround({
		terrainHeightAt,
		octree,
		top: 20
	});
	return {
		ground,
		counts,
		octree,
		terrainHeightAt,
		createOctree(height = 4, kind = 'replacement-floor') {
			return createFloorOctree(counts, height, kind);
		},
		createTerrain(offset = 2) {
			return (x, z) => {
				counts.terrain += 1;
				return offset + x * 0.02 + z * 0.01;
			};
		}
	};
}

function createFloorOctree(counts, height, kind) {
	return {
		raycast(ray, maximumDistance, predicate) {
			counts.rays += 1;
			const item = {
				solid: true,
				floor: true,
				normal: { x: 0, y: 1, z: 0 },
				kind
			};
			if (!predicate(item)) return null;
			const distance = ray.origin.y - height;
			if (distance < 0 || distance > maximumDistance) return null;
			return {
				distance,
				point: { x: ray.origin.x, y: height, z: ray.origin.z },
				normal: item.normal,
				item
			};
		}
	};
}
