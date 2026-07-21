// B"H

import { hashCanonicalValue } from "../../../foundation/canonical/index.js";
import { readGeometryPoint, assertIndexedTriangleGeometry } from "../triangleGeometry.js";
import { createCompactionPlan } from "./createCompactionPlan.js";

function appendAttributeSignature(values, attributes, vertexIndex, includePosition) {
	for (const [name, attribute] of Object.entries(attributes).sort()) {
		if ((!includePosition && name === "position") || attribute.domain !== "vertex") continue;
		const offset = vertexIndex * attribute.itemSize;
		values.push(name, attribute.componentType, attribute.itemSize);
		values.push(...attribute.array.slice(offset, offset + attribute.itemSize));
	}
}

function vertexSignature(geometry, vertexIndex) {
	const values = [];
	appendAttributeSignature(values, geometry.attributes, vertexIndex, false);
	for (const [target, attributes] of Object.entries(geometry.morphTargets).sort()) {
		values.push(target);
		appendAttributeSignature(values, attributes, vertexIndex, true);
	}
	return JSON.stringify(values);
}

function distanceSquared(left, right) {
	return (left[0] - right[0]) ** 2
		+ (left[1] - right[1]) ** 2
		+ (left[2] - right[2]) ** 2;
}

function cell(point, tolerance) {
	return tolerance === 0
		? point.join(":")
		: point.map(value => Math.floor(value / tolerance)).join(":");
}

function candidateKeys(point, tolerance) {
	if (tolerance === 0) return [cell(point, tolerance)];
	const base = point.map(value => Math.floor(value / tolerance));
	const keys = [];
	for (let x = -1; x <= 1; x += 1) {
		for (let y = -1; y <= 1; y += 1) {
			for (let z = -1; z <= 1; z += 1) {
				keys.push([base[0] + x, base[1] + y, base[2] + z].join(":"));
			}
		}
	}
	return keys.sort();
}

function normalizeOptions(options) {
	const tolerance = options.tolerance ?? 0;
	const policy = options.policy ?? "strict";
	if (!Number.isFinite(tolerance) || tolerance < 0) {
		throw new RangeError("Weld tolerance must be finite and non-negative.");
	}
	if (!["strict", "position-only"].includes(policy)) {
		throw new TypeError(`Unsupported weld policy: ${policy}`);
	}
	return { tolerance, policy };
}

/** Creates the exact many-to-one vertex plan consumed by geometry and lineage APIs. */
export function createVertexWeldPlan(geometryInput, options = {}) {
	const geometry = assertIndexedTriangleGeometry(geometryInput);
	const { tolerance, policy } = normalizeOptions(options);
	const position = geometry.attributes.position;
	const buckets = new Map();
	const representatives = [];
	const representativeBySource = [];
	for (let vertex = 0; vertex < position.count; vertex += 1) {
		const point = readGeometryPoint(position, vertex);
		const signature = policy === "strict" ? vertexSignature(geometry, vertex) : null;
		const candidates = candidateKeys(point, tolerance)
			.flatMap(key => buckets.get(key) ?? [])
			.sort((left, right) => left - right);
		const match = candidates.find(candidate => (
			distanceSquared(point, representatives[candidate].point) <= tolerance ** 2
			&& (policy !== "strict" || representatives[candidate].signature === signature)
		));
		const representative = match ?? representatives.length;
		if (match == null) {
			representatives.push({ point, signature, sourceVertex: vertex });
			const key = cell(point, tolerance);
			buckets.set(key, [...(buckets.get(key) ?? []), representative]);
		}
		representativeBySource[vertex] = representatives[representative].sourceVertex;
	}
	const representativeIndices = geometry.indices.array.map(vertex => representativeBySource[vertex]);
	const remapped = { ...geometry, indices: { ...geometry.indices, array: representativeIndices } };
	const compactionPlan = createCompactionPlan(remapped);
	return Object.freeze({
		planSchema: "awtsmoos.vertex-weld-plan",
		sourceGeometryHash: hashCanonicalValue(geometry),
		tolerance,
		policy,
		representativeBySource: Object.freeze(representativeBySource),
		targetIndexBySource: Object.freeze(representativeBySource
			.map(source => compactionPlan.targetIndexBySource[source])),
		representativeIndices: Object.freeze(representativeIndices),
		compactionPlan
	});
}

export function assertVertexWeldPlan(geometry, plan) {
	if (!plan || plan.planSchema !== "awtsmoos.vertex-weld-plan") throw new TypeError("Vertex weld plan is invalid.");
	if (plan.sourceGeometryHash !== hashCanonicalValue(geometry)) throw new Error("Vertex weld plan does not match geometry.");
	return plan;
}
