// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos unfolds children and leaves from one stable branch record.
 * This Awtsmoos.com planner isolates foliage randomness, records attachments,
 * and conserves parent pipe area instead of inventing impossible thickness.
 */

import { Vec3 } from "../../../math/vec3.js";
import { calculateTreeChildRadius } from "./treePipeModel.js";
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

function childLength(context, level, index, count) {
	const base = treeSkeletonValue(context.config, "length", level, 1);
	const variation = context.streams.structure.random(0.88, 1.12);
	const evergreenScale = context.config.type === "evergreen"
		? 1 - 0.25 * index / Math.max(1, count - 1)
		: 1;
	return base * variation * evergreenScale;
}

function childRadius(context, parentNode, level, siblingCount) {
	const requested = treeSkeletonValue(context.config, "radius", level, 0.1)
		* context.streams.structure.random(0.9, 1.1);
	return roundTreeSkeletonValue(calculateTreeChildRadius(
		parentNode.radius,
		siblingCount,
		requested / Math.max(0.0001, parentNode.radius),
		context.config.branch?.pipeModel || {}
	));
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
	const angle = treeSkeletonValue(context.config, "angle", nextLevel, 45) * Math.PI / 180;
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
			parentNodeId: parentNode.id,
			level: nextLevel,
			position: parentNode.position,
			direction: createTreeSkeletonBranchDirection(
				parentNode.direction,
				angle,
				offset + index * GOLDEN_TREE_ANGLE
			),
			length: childLength(context, nextLevel, index, count),
			radius: childRadius(context, parentNode, nextLevel, count)
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
	const angle = Number(leaf.angle ?? 75) * Math.PI / 180;
	for (let index = 0; index < count; index += 1) {
		const progress = start + (1 - start) * ((index + 0.5) / Math.max(1, count));
		const nodeIndex = Math.min(
			branch.nodes.length - 1,
			Math.round(progress * (branch.nodes.length - 1))
		);
		const node = branch.nodes[nodeIndex];
		const direction = createTreeSkeletonBranchDirection(
			node.direction,
			angle,
			offset + index * GOLDEN_TREE_ANGLE
		);
		const size = Math.max(0, Number(leaf.size || 0)
			* context.streams.foliage.random(0.75, 1.25));
		const position = Vec3.add(node.position, Vec3.scale(direction, node.radius * 0.7));
		context.leaves.push(Object.freeze({
			id: `leaf_${String(context.leaves.length).padStart(7, "0")}`,
			branchId: branch.id,
			nodeId: node.id,
			position: Object.freeze(position.map(roundTreeSkeletonValue)),
			direction: Object.freeze(direction.map(roundTreeSkeletonValue)),
			size: roundTreeSkeletonValue(size),
			aspect: roundTreeSkeletonValue(Math.max(0.05, Number(leaf.aspect || 0.72))),
			billboard: String(leaf.billboard || leaf.billboardStyle || "double"),
			color: Object.freeze(normalizeTreeSkeletonColor(leaf.tint))
		}));
	}
}
