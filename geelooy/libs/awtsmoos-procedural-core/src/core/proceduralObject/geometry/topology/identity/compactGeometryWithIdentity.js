// B"H

import { compactGeometryVertices } from "../compactGeometryVertices.js";
import { createCompactionPlan } from "../plans/createCompactionPlan.js";
import { createIdentityTransition } from "./createIdentityTransition.js";
import { assertTopologyIdentityMatchesGeometry } from "./identityContract.js";

/** Compacts geometry and returns the exact persistent topology lineage. */
export function compactGeometryWithIdentity(geometry, sourceIdentity, options = {}) {
	assertTopologyIdentityMatchesGeometry(sourceIdentity, geometry);
	const plan = options.plan ?? createCompactionPlan(geometry);
	const targetGeometry = compactGeometryVertices(geometry, {
		id: options.id ?? geometry.id,
		plan
	});
	const transition = createIdentityTransition({
		operation: "compact_geometry",
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
