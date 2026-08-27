// B"H

import { createGeometryArtifact } from "../../artifact/createGeometryArtifact.js";
import { assertIndexedTriangleGeometry } from "./triangleGeometry.js";

function validateAssignments(assignments, faceCount, slotCount) {
	if (!Array.isArray(assignments) || assignments.length !== faceCount) {
		throw new RangeError("Face material assignments must match triangle count.");
	}
	for (const materialIndex of assignments) {
		if (!Number.isInteger(materialIndex) || materialIndex < 0 || materialIndex >= slotCount) {
			throw new RangeError(`Face material index exceeds material slots: ${materialIndex}`);
		}
	}
}

function buildGroups(assignments) {
	const groups = [];
	for (let face = 0; face < assignments.length; face += 1) {
		const materialIndex = assignments[face];
		const current = groups.at(-1);
		if (current?.materialIndex === materialIndex) {
			current.count += 3;
		} else {
			groups.push({ start: face * 3, count: 3, materialIndex });
		}
	}
	return groups;
}

/** Assigns one material slot per triangle and compresses contiguous runs to groups. */
export function assignFaceMaterials(geometryInput, assignments, options = {}) {
	const geometry = assertIndexedTriangleGeometry(geometryInput);
	const materialSlots = options.materialSlots ?? geometry.materialSlots;
	validateAssignments(assignments, geometry.indices.array.length / 3, materialSlots.length);
	return createGeometryArtifact({
		...geometry,
		id: options.id ?? geometry.id,
		materialSlots,
		groups: buildGroups(assignments),
		drawRange: { start: 0, count: geometry.indices.array.length }
	});
}

/** Resolves each face's first covering material group, defaulting to slot zero. */
export function readFaceMaterialAssignments(geometryInput) {
	const geometry = assertIndexedTriangleGeometry(geometryInput);
	const faceCount = geometry.indices.array.length / 3;
	return Object.freeze(Array.from({ length: faceCount }, (_, face) => {
		const offset = face * 3;
		const group = geometry.groups.find(candidate => (
			offset >= candidate.start && offset < candidate.start + candidate.count
		));
		return group?.materialIndex ?? 0;
	}));
}
