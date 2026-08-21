// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OctreeCollisionWorld.js
 * @description Wraps the shared Awtsmoos SpatialItemOctree with Ohrfront-specific AABB registration and queries.
 * The Awtsmoos renews the whole world while a player asks only what is near; Awtsmoos.com reveals that mercy
 * through an octree whose branches narrow the question without pretending the branch is the source of space.
 */

import {
	createAwtsmoosWorldOctree
} from "../world/AwtsmoosCoreAdapter.js";

function intersectsSegmentAabb(start, end, aabb) {
	let minimumTime = 0;
	let maximumTime = 1;
	for (const axis of ["x", "y", "z"]) {
		const delta = end[axis] - start[axis];
		if (Math.abs(delta) < 0.000001) {
			if (start[axis] < aabb.min[axis] || start[axis] > aabb.max[axis]) return false;
			continue;
		}
		const inverse = 1 / delta;
		let near = (aabb.min[axis] - start[axis]) * inverse;
		let far = (aabb.max[axis] - start[axis]) * inverse;
		if (near > far) [near, far] = [far, near];
		minimumTime = Math.max(minimumTime, near);
		maximumTime = Math.min(maximumTime, far);
		if (minimumTime > maximumTime) return false;
	}
	return true;
}

/** Shared-core octree facade for static battlefield collision. */
export class OctreeCollisionWorld {
	constructor(THREE) {
		this.THREE = THREE;
		this.tree = createAwtsmoosWorldOctree({
			min: { x: -240, y: -80, z: -240 },
			max: { x: 240, y: 140, z: 240 }
		});
	}

	registerMesh(mesh, type = "cover") {
		mesh.updateMatrixWorld(true);
		const box = new this.THREE.Box3().setFromObject(mesh);
		const item = {
			mesh,
			type,
			aabb: {
				min: { x: box.min.x, y: box.min.y, z: box.min.z },
				max: { x: box.max.x, y: box.max.y, z: box.max.z }
			}
		};
		this.tree.insert(item);
		return item;
	}

	queryPoint(position, radius = 0.8) {
		return this.tree.query({
			min: { x: position.x - radius, y: position.y - 1, z: position.z - radius },
			max: { x: position.x + radius, y: position.y + 2, z: position.z + radius }
		});
	}

	segmentHitsStatic(start, end) {
		const envelope = {
			min: { x: Math.min(start.x, end.x), y: Math.min(start.y, end.y), z: Math.min(start.z, end.z) },
			max: { x: Math.max(start.x, end.x), y: Math.max(start.y, end.y), z: Math.max(start.z, end.z) }
		};
		return this.tree.query(envelope).some(item => intersectsSegmentAabb(start, end, item.aabb));
	}

	resolveHorizontal(position, radius = 0.75) {
		for (const item of this.queryPoint(position, radius)) {
			if (position.y > item.aabb.max.y + 0.4 || position.y < item.aabb.min.y - 2) continue;
			const expanded = {
				minX: item.aabb.min.x - radius,
				maxX: item.aabb.max.x + radius,
				minZ: item.aabb.min.z - radius,
				maxZ: item.aabb.max.z + radius
			};
			if (position.x <= expanded.minX || position.x >= expanded.maxX) continue;
			if (position.z <= expanded.minZ || position.z >= expanded.maxZ) continue;
			const escapeX = Math.min(position.x - expanded.minX, expanded.maxX - position.x);
			const escapeZ = Math.min(position.z - expanded.minZ, expanded.maxZ - position.z);
			if (escapeX < escapeZ) position.x = position.x < (expanded.minX + expanded.maxX) / 2 ? expanded.minX : expanded.maxX;
			else position.z = position.z < (expanded.minZ + expanded.maxZ) / 2 ? expanded.minZ : expanded.maxZ;
		}
		return position;
	}
}
