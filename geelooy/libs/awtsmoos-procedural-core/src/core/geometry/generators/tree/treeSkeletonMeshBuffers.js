// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos clothes a stable skeleton in indexed arrays without changing
 * its identity. These Awtsmoos.com buffer helpers are renderer-neutral,
 * deterministic, linear in emitted geometry, and bounded by explicit budgets.
 */

import { Vec3 } from "../../../math/vec3.js";

export function createTreeSkeletonGeometryBuffer(withColors = false) {
	const buffer = { positions: [], normals: [], uvs: [], indices: [] };
	if (withColors) {
		buffer.colors = [];
	}
	return buffer;
}

export function addTreeSkeletonRing(buffer, node, normal, binormal, radial, v) {
	const start = buffer.positions.length / 3;
	for (let segment = 0; segment <= radial; segment += 1) {
		const u = segment / radial;
		const angle = u * Math.PI * 2;
		const outward = Vec3.add(
			Vec3.scale(normal, Math.cos(angle)),
			Vec3.scale(binormal, Math.sin(angle))
		);
		buffer.positions.push(...Vec3.add(node.position, Vec3.scale(outward, node.radius)));
		buffer.normals.push(...outward);
		buffer.uvs.push(u, v);
	}
	return start;
}

export function stitchTreeSkeletonRings(buffer, first, second, radial) {
	for (let segment = 0; segment < radial; segment += 1) {
		const a = first + segment;
		const b = first + segment + 1;
		const c = second + segment;
		const d = second + segment + 1;
		buffer.indices.push(a, c, b, b, c, d);
	}
}

export function addTreeSkeletonLeaf(buffer, leaf) {
	const normal = Vec3.normalize(leaf.direction);
	const right = initialTreeSkeletonNormal(normal);
	const up = Vec3.normalize(Vec3.cross(normal, right));
	const half = leaf.size * 0.5;
	const start = buffer.positions.length / 3;
	for (const [x, y, u, v] of [[-1, -1, 0, 0], [1, -1, 1, 0], [1, 1, 1, 1], [-1, 1, 0, 1]]) {
		const position = Vec3.add(
			leaf.position,
			Vec3.add(Vec3.scale(right, x * half), Vec3.scale(up, y * half))
		);
		buffer.positions.push(...position);
		buffer.normals.push(...normal);
		buffer.uvs.push(u, v);
		buffer.colors.push(...leaf.color);
	}
	buffer.indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
}

export function sampleTreeSkeletonNodes(nodes, scaleValue) {
	const count = Math.max(2, Math.round((nodes.length - 1) * scaleValue) + 1);
	return Array.from({ length: count }, (_, index) => (
		nodes[Math.round(index * (nodes.length - 1) / Math.max(1, count - 1))]
	));
}

export function initialTreeSkeletonNormal(tangent) {
	const reference = Math.abs(tangent[1]) < 0.95 ? [0, 1, 0] : [1, 0, 0];
	return Vec3.normalize(Vec3.cross(tangent, reference));
}

export function transportTreeSkeletonNormal(normal, tangent) {
	const projected = Vec3.add(normal, Vec3.scale(tangent, -Vec3.dot(normal, tangent)));
	return Math.hypot(...projected) < 1e-8
		? initialTreeSkeletonNormal(tangent)
		: Vec3.normalize(projected);
}

export function enforceTreeSkeletonBudget(stats, budget = {}) {
	const vertices = stats.branchVertices + stats.leafVertices;
	const triangles = stats.branchTriangles + stats.leafTriangles;
	if ((budget.maxVertices && vertices > budget.maxVertices)
		|| (budget.maxTriangles && triangles > budget.maxTriangles)) {
		const error = new Error("Tree geometry exceeds the declared resource budget.");
		error.code = "RESOURCE_BUDGET_EXCEEDED";
		error.details = { vertices, triangles, budget };
		throw error;
	}
}
