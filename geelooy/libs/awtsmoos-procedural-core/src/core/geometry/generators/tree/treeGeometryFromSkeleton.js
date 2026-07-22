// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos clothes one canonical skeleton in many levels of detail.
 * This Awtsmoos.com tessellator transports stable frames, applies canonical
 * node twist at emission, and never regenerates branch or leaf identities.
 */

import { Vec3 } from "../../../math/vec3.js";
import {
	addTreeSkeletonLeaf,
	addTreeSkeletonRing,
	createTreeSkeletonGeometryBuffer,
	enforceTreeSkeletonBudget,
	initialTreeSkeletonNormal,
	sampleTreeSkeletonNodes,
	stitchTreeSkeletonRings,
	transportTreeSkeletonNormal
} from "./treeSkeletonMeshBuffers.js";

function buildBranch(buffer, branch, profile) {
	const radial = Math.max(3, Math.round(branch.radialSegments * profile.radialScale));
	const nodes = sampleTreeSkeletonNodes(branch.nodes, profile.longitudinalScale);
	let previousRing = null;
	let transportedNormal = initialTreeSkeletonNormal(nodes[0].direction);
	for (let index = 0; index < nodes.length; index += 1) {
		const node = nodes[index];
		const tangent = Vec3.normalize(node.direction);
		transportedNormal = transportTreeSkeletonNormal(transportedNormal, tangent);
		const ringNormal = Vec3.rotate(transportedNormal, tangent, node.twist || 0);
		const binormal = Vec3.normalize(Vec3.cross(tangent, ringNormal));
		const ring = addTreeSkeletonRing(
			buffer,
			node,
			ringNormal,
			binormal,
			radial,
			index / Math.max(1, nodes.length - 1)
		);
		if (previousRing !== null) {
			stitchTreeSkeletonRings(buffer, previousRing, ring, radial);
		}
		previousRing = ring;
	}
}

function buildStats(branches, leaves, branchCount) {
	return Object.freeze({
		branchVertices: branches.positions.length / 3,
		leafVertices: leaves.positions.length / 3,
		branchTriangles: branches.indices.length / 3,
		leafTriangles: leaves.indices.length / 3,
		generatedBranches: branchCount,
		drawCalls: 2
	});
}

export function buildTreeGeometryFromSkeleton(skeleton, profile, budget = {}) {
	const branches = createTreeSkeletonGeometryBuffer();
	const leaves = createTreeSkeletonGeometryBuffer(true);
	for (const branch of skeleton.branches) {
		buildBranch(branches, branch, profile);
	}
	const leafStride = Math.max(1, Math.round(1 / Math.max(0.01, profile.leafScale)));
	for (let index = 0; index < skeleton.leaves.length; index += leafStride) {
		addTreeSkeletonLeaf(leaves, skeleton.leaves[index]);
	}
	const stats = buildStats(branches, leaves, skeleton.branches.length);
	enforceTreeSkeletonBudget(stats, budget);
	return { branches, leaves, stats };
}
