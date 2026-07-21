// B"H

import { createGeometryArtifact } from "../../artifact/createGeometryArtifact.js";
import { buildVertexNormals } from "../buildVertexNormals.js";
import { assignFaceMaterials } from "./assignFaceMaterials.js";
import { compactGeometryVertices } from "./compactGeometryVertices.js";
import {
	assertTriangleRepairPlan,
	createTriangleRepairPlan
} from "./plans/createTriangleRepairPlan.js";

function filterFaces(geometry, plan) {
	const stripped = createGeometryArtifact({
		...geometry,
		indices: { ...geometry.indices, array: plan.filteredIndices },
		groups: [],
		drawRange: { start: 0, count: plan.filteredIndices.length }
	});
	return geometry.materialSlots.length
		? assignFaceMaterials(stripped, plan.retainedMaterialAssignments)
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
 * Removes declared triangle defects through one immutable operation plan.
 * Every surviving material, attribute, morph, face, and vertex follows that plan.
 */
export function repairTriangleGeometry(geometryInput, options = {}) {
	const plan = assertTriangleRepairPlan(
		geometryInput,
		options.plan ?? createTriangleRepairPlan(geometryInput, options)
	);
	let geometry = filterFaces(geometryInput, plan);
	if (plan.compact) {
		geometry = compactGeometryVertices(geometry, {
			id: options.id ?? geometry.id,
			plan: plan.compactionPlan
		});
	}
	if (plan.recomputeNormals) geometry = rebuildNormals(geometry);
	return createGeometryArtifact({
		...geometry,
		id: options.id ?? geometry.id,
		metadata: {
			...geometry.metadata,
			removedFaceCount: plan.removedFaces.length,
			repairSourceFaceCount: plan.report.faceCount
		}
	});
}
