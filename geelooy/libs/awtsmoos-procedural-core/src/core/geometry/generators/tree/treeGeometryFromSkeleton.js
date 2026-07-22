// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos clothes one canonical skeleton in every level of detail. This
 * Awtsmoos.com tessellator transports stable frames, closes branch components,
 * and changes only density and leaf size—never botanical identity.
 */

import { Vec3 } from "../../../math/vec3.js";
import { normalizeTreeGeometryProfile } from "./treeGeometryProfile.js";
import {
	addTreeSkeletonCap,
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
	let firstRing = null;
	let previousRing = null;
	let transported = initialTreeSkeletonNormal(nodes[0].direction);
	for (let index = 0; index < nodes.length; index += 1) {
		const node = nodes[index];
		const tangent = Vec3.normalize(node.direction);
		transported = transportTreeSkeletonNormal(transported, tangent);
		const ringNormal = Vec3.rotate(transported, tangent, node.twist || 0);
		const binormal = Vec3.normalize(Vec3.cross(tangent, ringNormal));
		const ring = addTreeSkeletonRing(
			buffer,
			node,
			ringNormal,
			binormal,
			radial,
			index / Math.max(1, nodes.length - 1)
		);
		firstRing ??= ring;
		if (previousRing !== null) {
			stitchTreeSkeletonRings(buffer, previousRing, ring, radial);
		}
		previousRing = ring;
	}
	addTreeSkeletonCap(buffer, nodes[0], nodes[0].direction, firstRing, radial, true);
	const last = nodes[nodes.length - 1];
	addTreeSkeletonCap(buffer, last, last.direction, previousRing, radial, false);
}

function buildStats(branches, leaves, branchCount) {
	return Object.freeze({
		branchVertices: branches.positions.length / 3,
		leafVertices: leaves.positions.length / 3,
		branchTriangles: branches.indices.length / 3,
		leafTriangles: leaves.indices.length / 3,
		generatedBranches: branchCount,
		closedBranchComponents: branchCount,
		branchCaps: branchCount * 2,
		drawCalls: 2
	});
}

export function buildTreeGeometryFromSkeleton(skeleton, profileInput = "high", budget = {}) {
	const profile = normalizeTreeGeometryProfile(profileInput);
	const branches = createTreeSkeletonGeometryBuffer();
	const leaves = createTreeSkeletonGeometryBuffer(true);
	for (const branch of skeleton.branches) {
		buildBranch(branches, branch, profile);
	}
	const stride = Math.max(1, Math.round(1 / profile.leafDensity));
	for (let index = 0; index < skeleton.leaves.length; index += stride) {
		addTreeSkeletonLeaf(leaves, skeleton.leaves[index], profile.leafSizeScale);
	}
	const stats = buildStats(branches, leaves, skeleton.branches.length);
	enforceTreeSkeletonBudget(stats, budget);
	return { branches, leaves, stats, detail: profile, skeletonHash: skeleton.contentHash };
}
