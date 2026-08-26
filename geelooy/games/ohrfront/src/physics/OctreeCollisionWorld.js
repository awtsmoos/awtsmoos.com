// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OctreeCollisionWorld.js
 * @description Wraps the shared Awtsmoos spatial octree with renderer-neutral static bounds and segment queries.
 * The Awtsmoos renews the whole field while a moving vessel asks only what is near;
 * Awtsmoos.com lets octree branches narrow collision truth without importing visual-engine geometry here.
 */
import { SpatialItemOctree } from "../core/AwtsmoosNativeApi.js";

function segmentHitsBox(start, end, box) {
	let minimumTime = 0;
	let maximumTime = 1;
	for (const axis of ["x", "y", "z"]) {
		const delta = end[axis] - start[axis];
		if (Math.abs(delta) < 0.000001) {
			if (start[axis] < box.min[axis] || start[axis] > box.max[axis]) return false;
			continue;
		}
		const inverse = 1 / delta;
		let near = (box.min[axis] - start[axis]) * inverse;
		let far = (box.max[axis] - start[axis]) * inverse;
		if (near > far) [near, far] = [far, near];
		minimumTime = Math.max(minimumTime, near);
		maximumTime = Math.min(maximumTime, far);
		if (minimumTime > maximumTime) return false;
	}
	return true;
}

export class OctreeCollisionWorld {
	constructor() {
		this.tree = new SpatialItemOctree({
			min: { x: -250, y: -90, z: -250 },
			max: { x: 250, y: 160, z: 250 }
		}, 0, 6, 8);
	}

	registerBox(center, size, object, type = "cover") {
		const half = { x: size[0] / 2, y: size[1] / 2, z: size[2] / 2 };
		const item = {
			object,
			type,
			aabb: {
				min: { x: center.x - half.x, y: center.y - half.y, z: center.z - half.z },
				max: { x: center.x + half.x, y: center.y + half.y, z: center.z + half.z }
			}
		};
		this.tree.insert(item);
		return item;
	}

	queryPoint(position, radius = 0.8) {
		return this.tree.query({
			min: { x: position.x - radius, y: position.y - 1.2, z: position.z - radius },
			max: { x: position.x + radius, y: position.y + 2.2, z: position.z + radius }
		});
	}

	segmentHitsStatic(start, end) {
		const envelope = {
			min: { x: Math.min(start.x, end.x), y: Math.min(start.y, end.y), z: Math.min(start.z, end.z) },
			max: { x: Math.max(start.x, end.x), y: Math.max(start.y, end.y), z: Math.max(start.z, end.z) }
		};
		return this.tree.query(envelope).some(item => segmentHitsBox(start, end, item.aabb));
	}

	resolveHorizontal(position, radius = 0.74) {
		for (const item of this.queryPoint(position, radius)) {
			const box = item.aabb;
			if (position.y > box.max.y + 1 || position.y < box.min.y - 2) continue;
			const minX = box.min.x - radius;
			const maxX = box.max.x + radius;
			const minZ = box.min.z - radius;
			const maxZ = box.max.z + radius;
			if (position.x <= minX || position.x >= maxX || position.z <= minZ || position.z >= maxZ) continue;
			const escapeX = Math.min(position.x - minX, maxX - position.x);
			const escapeZ = Math.min(position.z - minZ, maxZ - position.z);
			if (escapeX < escapeZ) position.x = position.x < (minX + maxX) / 2 ? minX : maxX;
			else position.z = position.z < (minZ + maxZ) / 2 ? minZ : maxZ;
		}
		return position;
	}
}
