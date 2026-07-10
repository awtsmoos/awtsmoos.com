// B"H
/**
 * @file ForestCollision.js
 * @description
 * Collision is carved only from branch triangles visibly present in the lower
 * trunk. The radius is measured from each generated tree, so broad baobabs and
 * narrow cypresses both receive truthful collision without proxy primitives.
 */
import { TriangleCollider } from '../../collision/TriangleCollider.js';
import { transformTreePoint } from './ForestGeometry.js';

function pointAt(positions, index, record) {
	const offset = index * 3;
	return transformTreePoint([
		positions[offset],
		positions[offset + 1],
		positions[offset + 2]
	], record);
}

function measuredTrunkRadius(record) {
	const positions = record.tree.branches.positions;
	const sampleHeight = record.y + record.policy.targetHeight * .14;
	const distances = [];
	for (let index = 0; index < positions.length / 3; index += 1) {
		const point = pointAt(positions, index, record);
		if (point.y > sampleHeight) continue;
		distances.push(Math.hypot(point.x - record.x, point.z - record.z));
	}
	if (!distances.length) {
		return record.policy.targetHeight * record.policy.collisionRadiusRatio;
	}
	distances.sort((first, second) => first - second);
	const percentile = distances[Math.floor((distances.length - 1) * .88)];
	const policyRadius = record.policy.targetHeight * record.policy.collisionRadiusRatio;
	return Math.max(policyRadius, percentile + .05);
}

function withinTrunk(record, points, radius) {
	const cutoff = record.y + record.policy.targetHeight * record.policy.collisionHeightRatio;
	if (points.some((point) => point.y > cutoff)) return false;
	const center = points.reduce((sum, point) => ({
		x: sum.x + point.x / points.length,
		z: sum.z + point.z / points.length
	}), { x: 0, z: 0 });
	return Math.hypot(center.x - record.x, center.z - record.z) <= radius;
}

export function createForestColliders(records) {
	const colliders = [];
	const perTree = [];
	for (const record of records) {
		const before = colliders.length;
		const geometry = record.tree.branches;
		const radius = measuredTrunkRadius(record);
		for (let index = 0; index < geometry.indices.length; index += 3) {
			const points = [
				pointAt(geometry.positions, geometry.indices[index], record),
				pointAt(geometry.positions, geometry.indices[index + 1], record),
				pointAt(geometry.positions, geometry.indices[index + 2], record)
			];
			if (!withinTrunk(record, points, radius)) continue;
			colliders.push(new TriangleCollider(points[0], points[1], points[2], {
				kind: `forest-tree-${record.index}-${record.policy.name}`,
				solid: true,
				floor: false
			}));
		}
		perTree.push({
			index: record.index,
			preset: record.policy.name,
			triangles: colliders.length - before,
			measuredRadius: Number(radius.toFixed(3))
		});
	}
	return {
		colliders,
		stats: {
			triangles: colliders.length,
			perTree,
			source: 'visible-lower-branch-triangles',
			radiusPolicy: 'measured-from-visible-lower-branch-vertices',
			proxyShapes: 0,
			canopyColliders: 0
		}
	};
}

export default createForestColliders;
