// B"H

import { buildEdgeIncidence, buildFaceComponents } from "./edgeIncidence.js";
import {
	assertIndexedTriangleGeometry,
	canonicalFaceKey,
	forEachTriangle,
	triangleCrossLengthSquared
} from "./triangleGeometry.js";

function freezeFaceGroups(groups) {
	return Object.freeze(groups.map(group => Object.freeze({
		key: group.key,
		faces: Object.freeze(group.faces)
	})));
}

function collectFaceDefects(geometry, epsilon) {
	const position = geometry.attributes.position;
	const repeated = [];
	const zeroArea = [];
	const faceMap = new Map();
	forEachTriangle(geometry, (a, b, c, faceIndex) => {
		if (a === b || b === c || c === a) repeated.push(faceIndex);
		if (triangleCrossLengthSquared(position, a, b, c) <= epsilon ** 2) {
			zeroArea.push(faceIndex);
		}
		const key = canonicalFaceKey(a, b, c);
		const faces = faceMap.get(key) ?? [];
		faces.push(faceIndex);
		faceMap.set(key, faces);
	});
	const duplicates = [...faceMap.entries()]
		.filter(([, faces]) => faces.length > 1)
		.map(([key, faces]) => ({ key, faces }))
		.sort((left, right) => left.key < right.key ? -1 : 1);
	return {
		repeated: Object.freeze(repeated),
		zeroArea: Object.freeze(zeroArea),
		duplicates: freezeFaceGroups(duplicates)
	};
}

/**
 * Reveals complete indexed-triangle topology without mutating geometry. Boundary,
 * manifoldness, components, duplicates, degeneracy, and isolation all emerge
 * from one deterministic incidence river beneath the creating Awtsmoos.
 */
export function analyzeTriangleTopology(geometryInput, options = {}) {
	const geometry = assertIndexedTriangleGeometry(geometryInput);
	const epsilon = options.epsilon ?? 1e-12;
	if (typeof epsilon !== "number" || !Number.isFinite(epsilon) || epsilon < 0) {
		throw new RangeError("Topology epsilon must be finite and non-negative.");
	}
	const indices = geometry.indices.array;
	const faceCount = indices.length / 3;
	const edgeRecords = buildEdgeIncidence(indices);
	const usedVertices = new Set(indices);
	const vertexCount = geometry.attributes.position.count;
	const isolatedVertices = [];
	for (let index = 0; index < vertexCount; index += 1) {
		if (!usedVertices.has(index)) isolatedVertices.push(index);
	}
	const defects = collectFaceDefects(geometry, epsilon);
	const degenerateFaces = Object.freeze([...new Set([
		...defects.repeated,
		...defects.zeroArea
	])].sort((left, right) => left - right));
	const boundaryEdges = Object.freeze(edgeRecords.filter(edge => edge.faces.length === 1));
	const nonManifoldEdges = Object.freeze(edgeRecords.filter(edge => edge.faces.length > 2));
	const components = buildFaceComponents(faceCount, edgeRecords);
	return Object.freeze({
		reportSchema: "awtsmoos.triangle-topology-report",
		geometryId: geometry.id,
		vertexCount,
		usedVertexCount: usedVertices.size,
		faceCount,
		edgeCount: edgeRecords.length,
		edges: edgeRecords,
		boundaryEdges,
		nonManifoldEdges,
		components,
		isolatedVertices: Object.freeze(isolatedVertices),
		repeatedIndexFaces: defects.repeated,
		zeroAreaFaces: defects.zeroArea,
		degenerateFaces,
		duplicateFaces: defects.duplicates,
		watertight: boundaryEdges.length === 0
			&& nonManifoldEdges.length === 0
			&& degenerateFaces.length === 0
	});
}
