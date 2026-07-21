// B"H

import { hashCanonicalValue } from "../../../foundation/canonical/index.js";
import { analyzeTriangleTopology } from "../analyzeTriangleTopology.js";
import { readFaceMaterialAssignments } from "../assignFaceMaterials.js";
import { createCompactionPlan } from "./createCompactionPlan.js";

function removedFaces(report, options) {
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

/** Describes face removal, material retention, and optional vertex contraction. */
export function createTriangleRepairPlan(geometry, options = {}) {
	const report = analyzeTriangleTopology(geometry, options);
	const removed = removedFaces(report, options);
	const retainedFaces = [];
	const faceTargetBySource = Array(report.faceCount).fill(null);
	const filteredIndices = [];
	const assignments = readFaceMaterialAssignments(geometry);
	const retainedMaterialAssignments = [];
	for (let face = 0; face < report.faceCount; face += 1) {
		if (removed.has(face)) continue;
		faceTargetBySource[face] = retainedFaces.length;
		retainedFaces.push(face);
		filteredIndices.push(...geometry.indices.array.slice(face * 3, face * 3 + 3));
		retainedMaterialAssignments.push(assignments[face]);
	}
	const compact = options.compact !== false;
	const filteredGeometry = {
		...geometry,
		indices: { ...geometry.indices, array: filteredIndices }
	};
	const compactionPlan = compact ? createCompactionPlan(filteredGeometry) : null;
	const vertexTargetBySource = compact
		? compactionPlan.targetIndexBySource
		: Object.freeze(Array.from(
			{ length: geometry.attributes.position.count },
			(_, index) => index
		));
	return Object.freeze({
		planSchema: "awtsmoos.triangle-repair-plan",
		sourceGeometryHash: hashCanonicalValue(geometry),
		report,
		compact,
		recomputeNormals: options.recomputeNormals !== false,
		removedFaces: Object.freeze([...removed].sort((left, right) => left - right)),
		retainedFaces: Object.freeze(retainedFaces),
		faceTargetBySource: Object.freeze(faceTargetBySource),
		filteredIndices: Object.freeze(filteredIndices),
		retainedMaterialAssignments: Object.freeze(retainedMaterialAssignments),
		vertexTargetBySource,
		compactionPlan
	});
}

export function assertTriangleRepairPlan(geometry, plan) {
	if (!plan || plan.planSchema !== "awtsmoos.triangle-repair-plan") throw new TypeError("Triangle repair plan is invalid.");
	if (plan.sourceGeometryHash !== hashCanonicalValue(geometry)) throw new Error("Triangle repair plan does not match geometry.");
	return plan;
}
