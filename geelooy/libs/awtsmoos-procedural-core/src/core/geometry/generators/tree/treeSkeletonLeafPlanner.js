//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file treeSkeletonLeafPlanner.js
 * @description Places species-aware leaf organs on stable structural branches or dedicated fine foliage twigs.
 * The Awtsmoos reveals leaf after twig without mechanical spirals; Awtsmoos.com preserves alpha-ready identity, rounded-normal intent, and deterministic variation.
 */

import { Vec3 } from "../../../math/vec3.js";
import {
	createTreeAttachmentSamples,
	sampleTreeBranchAttachment
} from "./treeAttachmentSampling.js";
import { maximumTreeSkeletonLevel } from "./treeSkeletonChildPlanner.js";
import {
	createTreeSkeletonBranchDirection,
	normalizeTreeSkeletonColor,
	roundTreeSkeletonValue
} from "./treeSkeletonMath.js";

/** Returns true when this branch owns visible foliage under the configured morphology. */
function receivesLeaves(context, branch) {
	const type = String(context.config.type || "deciduous");
	const twigsEnabled = context.config.leaves?.twigs?.enabled !== false;
	if (branch.role === "foliage-twig") return true;
	const terminal = branch.level >= maximumTreeSkeletonLevel(context);
	if (["evergreen", "palm"].includes(type)) return terminal;
	if (!terminal) return false;
	return !twigsEnabled || !context.foliageTwigParents?.has(branch.id);
}

/** Adds immutable foliage records whose geometry can later vary by renderer-neutral LOD policy. */
export function placeTreeSkeletonLeaves(context, branch) {
	if (!receivesLeaves(context, branch)) return;
	const leaf = context.config.leaves || {};
	const count = Math.max(0, Math.floor(Number(leaf.count || 0)));
	const start = branch.role === "foliage-twig"
		? Number(leaf.twigLeafStart ?? 0.12)
		: Number(leaf.start ?? 0.2);
	const angle = Number(leaf.angle ?? 75) * Math.PI / 180;
	const samples = createTreeAttachmentSamples(count, start, context.streams.foliage);
	for (const sample of samples) {
		const attachment = sampleTreeBranchAttachment(branch, sample.progress);
		const direction = createTreeSkeletonBranchDirection(
			attachment.direction,
			angle,
			sample.radialAngle
		);
		const sizeVariance = Math.max(0, Number(leaf.sizeVariance ?? 0.25));
		const variation = context.streams.foliage.random(1 - sizeVariance, 1 + sizeVariance);
		const size = Math.max(0, Number(leaf.size || 0) * variation);
		const position = Vec3.add(
			attachment.position,
			Vec3.scale(direction, Math.max(0.002, attachment.radius * 0.7))
		);
		context.leaves.push(Object.freeze({
			id: `leaf_${String(context.leaves.length).padStart(7, "0")}`,
			branchId: branch.id,
			nodeId: attachment.nodeId,
			position: Object.freeze(position.map(roundTreeSkeletonValue)),
			direction: Object.freeze(direction.map(roundTreeSkeletonValue)),
			size: roundTreeSkeletonValue(size),
			aspect: roundTreeSkeletonValue(Math.max(0.05, Number(leaf.aspect || 0.72))),
			billboard: String(leaf.billboard || leaf.billboardStyle || "double"),
			color: Object.freeze(normalizeTreeSkeletonColor(leaf.tint)),
			morphology: String(leaf.morphology || context.config.type || "broadleaf"),
			roundedNormals: leaf.roundedNormals !== false,
			textureType: String(leaf.type || "leaf")
		}));
	}
}
