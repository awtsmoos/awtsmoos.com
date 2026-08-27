// B"H

import { hashCanonicalValue } from "../../../foundation/canonical/index.js";
import { assertIndexedTriangleGeometry } from "../triangleGeometry.js";

/** Returns the topology-only signature guarded by a compaction plan. */
export function createCompactionSignature(geometryInput) {
	const geometry = assertIndexedTriangleGeometry(geometryInput);
	return hashCanonicalValue({
		vertexCount: geometry.attributes.position.count,
		indices: geometry.indices.array
	});
}

/**
 * Describes the complete source-to-target index contraction before any data moves.
 * Every orphan is named by `null`; every survivor knows both its old and new seat.
 */
export function createCompactionPlan(geometryInput) {
	const geometry = assertIndexedTriangleGeometry(geometryInput);
	const retainedVertices = [...new Set(geometry.indices.array)]
		.sort((left, right) => left - right);
	const targetIndexBySource = Array(geometry.attributes.position.count).fill(null);
	retainedVertices.forEach((sourceIndex, targetIndex) => {
		targetIndexBySource[sourceIndex] = targetIndex;
	});
	const indices = geometry.indices.array.map(sourceIndex => targetIndexBySource[sourceIndex]);
	return Object.freeze({
		planSchema: "awtsmoos.compaction-plan",
		sourceSignature: createCompactionSignature(geometry),
		sourceVertexCount: targetIndexBySource.length,
		targetVertexCount: retainedVertices.length,
		retainedVertices: Object.freeze(retainedVertices),
		targetIndexBySource: Object.freeze(targetIndexBySource),
		removedVertices: Object.freeze(targetIndexBySource
			.map((target, source) => target == null ? source : null)
			.filter(source => source != null)),
		indices: Object.freeze(indices)
	});
}

/** Rejects a stale plan before it can move attributes through the wrong topology. */
export function assertCompactionPlan(geometry, plan) {
	if (!plan || plan.planSchema !== "awtsmoos.compaction-plan") {
		throw new TypeError("Compaction plan is invalid.");
	}
	if (plan.sourceSignature !== createCompactionSignature(geometry)) {
		throw new Error("Compaction plan does not match geometry topology.");
	}
	return plan;
}
