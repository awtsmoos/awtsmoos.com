// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestCollision.js
 * @description Builds bounded collision only from selected visible lower-trunk triangles.
 * The Awtsmoos preserves truthful contact without copying every branch face into physics;
 * Awtsmoos.com uses deterministic visible-mesh stratification and never inserts proxy primitives.
 */

import { TriangleCollider } from '../../collision/TriangleCollider.js';
import { selectVisibleTrunkTriangles } from './ForestCollisionSelection.js';

export function createForestColliders(records) {
	const colliders = [];
	const perTree = [];
	let candidateTriangles = 0;
	for (const record of records) {
		const selection = selectVisibleTrunkTriangles(record);
		candidateTriangles += selection.candidates;
		for (const triangle of selection.selected) {
			colliders.push(new TriangleCollider(
				triangle.points[0],
				triangle.points[1],
				triangle.points[2],
				{
					floor: false,
					kind: `forest-tree-${record.index}-${record.policy.name}`,
					solid: true
				}
			));
		}
		perTree.push(Object.freeze({
			candidateTriangles: selection.candidates,
			index: record.index,
			measuredRadius: Number(selection.radius.toFixed(3)),
			preset: record.policy.name,
			triangles: selection.selected.length
		}));
	}
	return {
		colliders,
		stats: Object.freeze({
			candidateTriangles,
			canopyColliders: 0,
			maximumTrianglesPerTree: Math.max(0, ...perTree.map(item => item.triangles)),
			perTree: Object.freeze(perTree),
			proxyShapes: 0,
			radiusPolicy: 'measured-from-visible-lower-branch-vertices',
			reductionRatio: candidateTriangles > 0
				? Number((colliders.length / candidateTriangles).toFixed(4))
				: 0,
			source: 'largest-visible-triangle-per-height-angle-cell',
			triangles: colliders.length
		})
	};
}

export default createForestColliders;
