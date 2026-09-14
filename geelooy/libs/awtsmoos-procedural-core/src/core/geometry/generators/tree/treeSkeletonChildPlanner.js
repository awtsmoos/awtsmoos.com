//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file treeSkeletonChildPlanner.js
 * @description Plans structural children and fine foliage twigs with deterministic stratified attachment sampling.
 * The Awtsmoos spreads branch and twig without mechanical spirals; Awtsmoos.com preserves pipe area, stable lineage, and renderer-neutral intent.
 */

import { calculateTreeChildRadius } from "./treePipeModel.js";
import {
	createTreeAttachmentSamples,
	sampleTreeBranchAttachment
} from "./treeAttachmentSampling.js";
import {
	clampTreeSkeletonValue,
	createTreeSkeletonBranchDirection,
	roundTreeSkeletonValue,
	treeSkeletonValue
} from "./treeSkeletonMath.js";

/** Returns the configured structural branching depth. */
export function maximumTreeSkeletonLevel(context) {
	return Math.max(0, Math.floor(Number(context.config.branch?.levels || 0)));
}

/** Returns one biologically varied child length without changing parent identity. */
function childLength(context, level, sampleProgress) {
	const base = treeSkeletonValue(context.config, "length", level, 1);
	const variation = context.streams.structure.random(0.88, 1.12);
	const evergreenScale = context.config.type === "evergreen"
		? 1 - 0.25 * sampleProgress
		: 1;
	return base * variation * evergreenScale;
}

/** Conserves parent pipe area while respecting the requested species radius profile. */
function childRadius(context, parentRadius, level, siblingCount) {
	const requested = treeSkeletonValue(context.config, "radius", level, 0.1)
		* context.streams.structure.random(0.9, 1.1);
	return roundTreeSkeletonValue(calculateTreeChildRadius(
		parentRadius,
		siblingCount,
		requested / Math.max(0.0001, parentRadius),
		context.config.branch?.pipeModel || {}
	));
}

/** Adds normal structural children using independently stratified height and radial slots. */
export function enqueueTreeSkeletonChildren(context, branch, queue) {
	const nextLevel = branch.level + 1;
	if (branch.role === "foliage-twig" || nextLevel > maximumTreeSkeletonLevel(context)) return;
	const count = Math.max(0, Math.floor(
		treeSkeletonValue(context.config, "children", branch.level, 0)
	));
	const start = clampTreeSkeletonValue(
		treeSkeletonValue(context.config, "start", nextLevel, 0.2),
		0,
		0.98
	);
	const angle = treeSkeletonValue(context.config, "angle", nextLevel, 45) * Math.PI / 180;
	const samples = createTreeAttachmentSamples(count, start, context.streams.structure);
	for (const sample of samples) {
		if (queue.length + context.branches.length >= context.maximumBranches) break;
		const attachment = sampleTreeBranchAttachment(branch, sample.progress);
		queue.push({
			parentId: branch.id,
			parentNodeId: attachment.nodeId,
			level: nextLevel,
			position: attachment.position,
			direction: createTreeSkeletonBranchDirection(
				attachment.direction,
				angle,
				sample.radialAngle
			),
			length: childLength(context, nextLevel, sample.progress),
			radius: childRadius(context, attachment.radius, nextLevel, count),
			role: "structural"
		});
	}
}

/** Adds fine terminal twigs for individual-leaf morphology without forcing them into lower-detail meshes. */
export function enqueueTreeSkeletonFoliageTwigs(context, branch, queue) {
	const leaf = context.config.leaves || {};
	const twigs = leaf.twigs || {};
	const terminal = branch.level >= maximumTreeSkeletonLevel(context);
	if (!terminal || branch.role === "foliage-twig" || twigs.enabled === false) return;
	if (["evergreen", "palm"].includes(String(context.config.type))) return;
	const count = Math.max(0, Math.min(12, Math.floor(Number(twigs.count ?? 4))));
	const samples = createTreeAttachmentSamples(count, Number(twigs.start ?? 0.55), context.streams.foliage);
	const angle = Number(twigs.angle ?? 42) * Math.PI / 180;
	context.foliageTwigParents ??= new Set();
	for (const sample of samples) {
		if (queue.length + context.branches.length >= context.maximumBranches) break;
		const attachment = sampleTreeBranchAttachment(branch, sample.progress);
		queue.push({
			parentId: branch.id,
			parentNodeId: attachment.nodeId,
			level: maximumTreeSkeletonLevel(context) + 1,
			position: attachment.position,
			direction: createTreeSkeletonBranchDirection(attachment.direction, angle, sample.radialAngle),
			length: Math.max(0.08, Number(twigs.length ?? Math.max(0.35, leaf.size * 1.35))),
			radius: Math.max(
				0.0001,
				attachment.radius * Math.min(
					Number(twigs.radiusScale ?? 0.18),
					Math.sqrt(0.6 / Math.max(1, count))
				)
			),
			radialSegments: Math.max(3, Number(twigs.radialSegments ?? 3)),
			sections: Math.max(2, Number(twigs.sections ?? 3)),
			role: "foliage-twig"
		});
		context.foliageTwigParents.add(branch.id);
	}
}
