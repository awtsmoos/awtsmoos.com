// B"H

import { createGeometryArtifact } from "../../artifact/createGeometryArtifact.js";
import { buildVertexNormals } from "../buildVertexNormals.js";
import { analyzeTriangleTopology } from "./analyzeTriangleTopology.js";
import { assignFaceMaterials, readFaceMaterialAssignments } from "./assignFaceMaterials.js";
import { compactGeometryVertices } from "./compactGeometryVertices.js";

function facesToRemove(report, options) {
	const removed = new Set();
	if (options.removeDegenerate !== false) {
		for (const face of report.degenerateFaces) removed.add(face);
	}
	if (options.removeDuplicate !== false) {
		for (const duplicate of report.duplicateFaces) {
			for (const face of duplicate.faces.slice(1)) removed.add(face);
		}
	}
	return removed;
}

function filterFaces(geometry, removed) {
	const indices = [];
	const materials = [];
	const assignments = readFaceMaterialAssignments(geometry);
	for (let face = 0; face < geometry.indices.array.length / 3; face += 1) {
		if (removed.has(face)) continue;
		indices.push(...geometry.indices.array.slice(face * 3, face * 3 + 3));
		materials.push(assignments[face]);
	}
	const stripped = createGeometryArtifact({
		...geometry,
		indices: { ...geometry.indices, array: indices },
		groups: [],
		drawRange: { start: 0, count: indices.length }
	});
	return geometry.materialSlots.length
		? assignFaceMaterials(stripped, materials)
		: stripped;
}

function rebuildNormals(geometry) {
	const position = geometry.attributes.position;
	if (position.itemSize !== 3) {
		throw new TypeError("Normal rebuilding requires XYZ positions.");
	}
	const normal = {
		itemSize: 3,
		componentType: "float32",
		normalized: false,
		domain: "vertex",
		array: buildVertexNormals(position.array, geometry.indices.array)
	};
	return createGeometryArtifact({
		...geometry,
		attributes: { ...geometry.attributes, normal }
	});
}

/**
 * Removes declared triangle defects and restores a compact, normal-bearing mesh.
 * Every surviving attribute, morph, material run, and metadata strand remains
 * attached while false faces fall away into the nothing from which they came.
 */
export function repairTriangleGeometry(geometryInput, options = {}) {
	const report = analyzeTriangleTopology(geometryInput, options);
	const removed = facesToRemove(report, options);
	let geometry = filterFaces(geometryInput, removed);
	if (options.compact !== false) {
		geometry = compactGeometryVertices(geometry, { id: options.id ?? geometry.id });
	}
	if (options.recomputeNormals !== false) geometry = rebuildNormals(geometry);
	return createGeometryArtifact({
		...geometry,
		id: options.id ?? geometry.id,
		metadata: {
			...geometry.metadata,
			removedFaceCount: removed.size,
			repairSourceFaceCount: report.faceCount
		}
	});
}
