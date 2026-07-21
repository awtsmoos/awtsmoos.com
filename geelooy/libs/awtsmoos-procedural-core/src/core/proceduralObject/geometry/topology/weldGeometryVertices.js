// B"H

import { createGeometryArtifact } from "../../artifact/createGeometryArtifact.js";
import { compactGeometryVertices } from "./compactGeometryVertices.js";
import {
	assertVertexWeldPlan,
	createVertexWeldPlan
} from "./plans/createVertexWeldPlan.js";

/**
 * Welds nearby indexed vertices with an explicit seam-preservation policy.
 * Geometry and lineage consume the same frozen many-to-one plan.
 */
export function weldGeometryVertices(geometry, options = {}) {
	const plan = assertVertexWeldPlan(
		geometry,
		options.plan ?? createVertexWeldPlan(geometry, options)
	);
	const remapped = createGeometryArtifact({
		...geometry,
		id: options.id ?? geometry.id,
		indices: { ...geometry.indices, array: plan.representativeIndices },
		metadata: {
			...geometry.metadata,
			weldPolicy: plan.policy,
			weldTolerance: plan.tolerance
		}
	});
	return compactGeometryVertices(remapped, {
		id: options.id ?? geometry.id,
		plan: plan.compactionPlan
	});
}
