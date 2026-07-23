// B"H
// Boruch Hashem
// Blessed is He
/** Advanced geometry execution adds fields, joining, and deterministic subdivision. */
import { evaluateFieldDomain, evaluateSelectionField } from "./fieldDomain.js";

function artifact(positions, indices, metadata = {}) {
	return Object.freeze({
		schema: "awtsmoos.reference-geometry",
		positions: new Float32Array(positions),
		indices: new Uint32Array(indices),
		metadata: Object.freeze(metadata)
	});
}

function geometryOf(inputs, name = "geometry") {
	const geometry = inputs[name] ?? inputs.mesh;
	if (!geometry?.positions || !geometry?.indices) {
		throw new TypeError(`${name} requires a reference geometry artifact.`);
	}
	return geometry;
}

/** Executes Set Position over the point domain. */
export function executeSetPosition(inputs = {}) {
	const geometry = geometryOf(inputs);
	const count = geometry.positions.length / 3;
	const selection = evaluateSelectionField(inputs.selection, count);
	const positions = evaluateFieldDomain(inputs.position, count);
	const offsets = evaluateFieldDomain(inputs.offset ?? [0, 0, 0], count);
	const result = Array.from(geometry.positions);
	for (let index = 0; index < count; index += 1) {
		if (!selection[index]) continue;
		const source = Array.isArray(positions[index])
			? positions[index]
			: result.slice(index * 3, index * 3 + 3);
		const offset = Array.isArray(offsets[index]) ? offsets[index] : [0, 0, 0];
		for (let axis = 0; axis < 3; axis += 1) {
			result[index * 3 + axis] = Number(source[axis] ?? result[index * 3 + axis])
				+ Number(offset[axis] ?? 0);
		}
	}
	return Object.freeze({
		geometry: artifact(result, geometry.indices, { ...geometry.metadata, setPosition: true })
	});
}

/** Executes Join Geometry while preserving each input as a semantic range. */
export function executeJoinGeometry(inputs = {}) {
	const geometries = Array.isArray(inputs.geometry) ? inputs.geometry : [inputs.geometry];
	const positions = [];
	const indices = [];
	const ranges = [];
	for (const geometry of geometries.filter(Boolean)) {
		const vertexOffset = positions.length / 3;
		const firstIndex = indices.length;
		positions.push(...geometry.positions);
		indices.push(...Array.from(geometry.indices, index => index + vertexOffset));
		ranges.push(Object.freeze({
			firstVertex: vertexOffset,
			vertexCount: geometry.positions.length / 3,
			firstIndex,
			indexCount: geometry.indices.length,
			metadata: geometry.metadata ?? {}
		}));
	}
	return Object.freeze({
		geometry: artifact(positions, indices, { joined: true, ranges: Object.freeze(ranges) })
	});
}

function midpoint(positions, left, right) {
	return [0, 1, 2].map(axis => (
		(positions[left * 3 + axis] + positions[right * 3 + axis]) * 0.5
	));
}

/** Executes midpoint triangle subdivision with deterministic shared-edge caching. */
export function executeSubdivideMesh(inputs = {}) {
	let geometry = geometryOf(inputs, "mesh");
	const levels = Math.max(0, Math.min(6, Math.floor(inputs.level ?? 1)));
	for (let level = 0; level < levels; level += 1) {
		const positions = Array.from(geometry.positions);
		const indices = [];
		const edgeCache = new Map();
		const edgeVertex = (left, right) => {
			const key = left < right ? `${left}:${right}` : `${right}:${left}`;
			if (edgeCache.has(key)) return edgeCache.get(key);
			const index = positions.length / 3;
			positions.push(...midpoint(geometry.positions, left, right));
			edgeCache.set(key, index);
			return index;
		};
		for (let offset = 0; offset < geometry.indices.length; offset += 3) {
			const a = geometry.indices[offset];
			const b = geometry.indices[offset + 1];
			const c = geometry.indices[offset + 2];
			const ab = edgeVertex(a, b);
			const bc = edgeVertex(b, c);
			const ca = edgeVertex(c, a);
			indices.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca);
		}
		geometry = artifact(positions, indices, {
			...geometry.metadata,
			subdivisionLevel: Number(geometry.metadata?.subdivisionLevel ?? 0) + 1
		});
	}
	return Object.freeze({ mesh: geometry });
}
