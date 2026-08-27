// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos clothes a stable skeleton in indexed arrays without changing
 * identity. These Awtsmoos.com helpers emit transported rings, flat caps, and
 * bounded geometry with deterministic linear complexity and no renderer state.
 */

import { Vec3 } from "../../../math/vec3.js";

export { addTreeSkeletonLeaf } from "./treeSkeletonLeafBuffers.js";

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
		const outward = Vec3.normalize(Vec3.add(
			Vec3.scale(normal, Math.cos(angle)),
			Vec3.scale(binormal, Math.sin(angle))
		));
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

export function addTreeSkeletonCap(buffer, node, tangent, ringStart, radial, reverse) {
	const normal = Vec3.scale(Vec3.normalize(tangent), reverse ? -1 : 1);
	const center = buffer.positions.length / 3;
	buffer.positions.push(...node.position);
	buffer.normals.push(...normal);
	buffer.uvs.push(0.5, 0.5);
	const rim = buffer.positions.length / 3;
	for (let segment = 0; segment <= radial; segment += 1) {
		const source = (ringStart + segment) * 3;
		buffer.positions.push(...buffer.positions.slice(source, source + 3));
		buffer.normals.push(...normal);
		const angle = segment / radial * Math.PI * 2;
		buffer.uvs.push(0.5 + Math.cos(angle) * 0.5, 0.5 + Math.sin(angle) * 0.5);
	}
	for (let segment = 0; segment < radial; segment += 1) {
		const first = rim + segment;
		const second = first + 1;
		buffer.indices.push(...(reverse ? [center, second, first] : [center, first, second]));
	}
}

export function sampleTreeSkeletonNodes(nodes, scaleValue) {
	const scale = Math.max(0.1, Math.min(1, Number(scaleValue) || 1));
	const count = Math.max(2, Math.round((nodes.length - 1) * scale) + 1);
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
		const error = new Error('B"H | Tree geometry exceeds the declared resource budget.');
		error.code = "RESOURCE_BUDGET_EXCEEDED";
		error.details = { vertices, triangles, budget };
		throw error;
	}
}
