// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos unfolds children and leaves from one stable branch record.
 * This Awtsmoos.com planner keeps structural and foliage randomness isolated,
 * preserving branch identity when only leaf density or appearance changes.
 */

import {
	GOLDEN_TREE_ANGLE,
	clampTreeSkeletonValue,
	createTreeSkeletonBranchDirection,
	normalizeTreeSkeletonColor,
	roundTreeSkeletonValue,
	treeSkeletonValue
} from "./treeSkeletonMath.js";

function maximumLevel(context) {
	return Math.max(0, Math.floor(Number(context.config.branch?.levels || 0)));
}

export function enqueueTreeSkeletonChildren(context, branch, queue) {
	const nextLevel = branch.level + 1;
	if (nextLevel > maximumLevel(context)) {
		return;
	}
	const count = Math.max(0, Math.floor(
		treeSkeletonValue(context.config, "children", branch.level, 0)
	));
	const start = clampTreeSkeletonValue(
		treeSkeletonValue(context.config, "start", nextLevel, 0.2),
		0,
		0.98
	);
	const angle = treeSkeletonValue(context.config, "angle", nextLevel, 45)
		* Math.PI / 180;
	const offset = context.streams.structure.random(0, Math.PI * 2);
	for (let index = 0; index < count; index += 1) {
		if (queue.length + context.branches.length >= context.maximumBranches) {
			break;
		}
		const progress = start + (1 - start) * ((index + 0.5) / Math.max(1, count));
		const nodeIndex = Math.min(
			branch.nodes.length - 1,
			Math.round(progress * (branch.nodes.length - 1))
		);
		const parentNode = branch.nodes[nodeIndex];
		queue.push({
			parentId: branch.id,
			level: nextLevel,
			position: parentNode.position,
			direction: createTreeSkeletonBranchDirection(
				parentNode.direction,
				angle,
				offset + index * GOLDEN_TREE_ANGLE
			),
			length: treeSkeletonValue(context.config, "length", nextLevel, 1)
				* context.streams.structure.random(0.88, 1.12),
			radius: treeSkeletonValue(context.config, "radius", nextLevel, 0.1)
				* context.streams.structure.random(0.9, 1.1)
		});
	}
}

export function placeTreeSkeletonLeaves(context, branch) {
	const type = context.config.type;
	if (branch.level < maximumLevel(context) && type !== "evergreen" && type !== "palm") {
		return;
	}
	const leaf = context.config.leaves || {};
	const count = Math.max(0, Math.floor(Number(leaf.count || 0)));
	const start = clampTreeSkeletonValue(Number(leaf.start ?? 0.2), 0, 0.98);
	const offset = context.streams.foliage.random(0, Math.PI * 2);
	for (let index = 0; index < count; index += 1) {
		const progress = start + (1 - start) * ((index + 0.5) / Math.max(1, count));
		const nodeIndex = Math.min(
			branch.nodes.length - 1,
			Math.round(progress * (branch.nodes.length - 1))
		);
		const node = branch.nodes[nodeIndex];
		context.leaves.push(Object.freeze({
			id: `leaf_${String(context.leaves.length).padStart(7, "0")}`,
			branchId: branch.id,
			position: node.position,
			direction: createTreeSkeletonBranchDirection(
				node.direction,
				Math.PI / 2,
				offset + index * GOLDEN_TREE_ANGLE
			).map(roundTreeSkeletonValue),
			size: roundTreeSkeletonValue(Math.max(
				0,
				Number(leaf.size || 0) * context.streams.foliage.random(0.75, 1.25)
			)),
			color: normalizeTreeSkeletonColor(leaf.tint)
		}));
	}
}
