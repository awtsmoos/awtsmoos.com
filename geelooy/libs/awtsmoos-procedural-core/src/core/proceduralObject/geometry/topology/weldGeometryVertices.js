// B"H

import { createGeometryArtifact } from "../../artifact/createGeometryArtifact.js";
import { compactGeometryVertices } from "./compactGeometryVertices.js";
import { assertIndexedTriangleGeometry, readGeometryPoint } from "./triangleGeometry.js";

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

/** Welds nearby indexed vertices with explicit seam-preservation policy. */
export function weldGeometryVertices(geometryInput, options = {}) {
	const geometry = assertIndexedTriangleGeometry(geometryInput);
	const tolerance = options.tolerance ?? 0;
	const policy = options.policy ?? "strict";
	if (!Number.isFinite(tolerance) || tolerance < 0) {
		throw new RangeError("Weld tolerance must be finite and non-negative.");
	}
	if (!["strict", "position-only"].includes(policy)) {
		throw new TypeError(`Unsupported weld policy: ${policy}`);
	}
	const position = geometry.attributes.position;
	const buckets = new Map();
	const representatives = [];
	const representativeByVertex = [];
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
			representatives.push({ point, signature, vertex });
			const key = cell(point, tolerance);
			buckets.set(key, [...(buckets.get(key) ?? []), representative]);
		}
		representativeByVertex[vertex] = representatives[representative].vertex;
	}
	const indices = geometry.indices.array.map(vertex => representativeByVertex[vertex]);
	const remapped = createGeometryArtifact({
		...geometry,
		id: options.id ?? geometry.id,
		indices: { ...geometry.indices, array: indices },
		metadata: { ...geometry.metadata, weldPolicy: policy, weldTolerance: tolerance }
	});
	return compactGeometryVertices(remapped, { id: options.id ?? geometry.id });
}
