// B"H

import { weldGeometryVertices } from "../weldGeometryVertices.js";
import { createVertexWeldPlan } from "../plans/createVertexWeldPlan.js";
import { createIdentityTransition } from "./createIdentityTransition.js";
import { assertTopologyIdentityMatchesGeometry } from "./identityContract.js";

/** Welds geometry and returns many-to-one persistent vertex and edge lineage. */
export function weldGeometryWithIdentity(geometry, sourceIdentity, options = {}) {
	assertTopologyIdentityMatchesGeometry(sourceIdentity, geometry);
	const plan = options.plan ?? createVertexWeldPlan(geometry, options);
	const targetGeometry = weldGeometryVertices(geometry, {
		id: options.id ?? geometry.id,
		plan
	});
	const transition = createIdentityTransition({
		operation: "weld_geometry",
		sourceGeometry: geometry,
		sourceIdentity,
		targetGeometry,
		vertexTargetBySource: plan.targetIndexBySource,
		faceTargetBySource: Array.from(
			{ length: sourceIdentity.faceIds.length },
			(_, index) => index
		),
		metadata: options.identityMetadata,
		remapMetadata: options.remapMetadata
	});
	return Object.freeze({ geometry: targetGeometry, ...transition });
}
