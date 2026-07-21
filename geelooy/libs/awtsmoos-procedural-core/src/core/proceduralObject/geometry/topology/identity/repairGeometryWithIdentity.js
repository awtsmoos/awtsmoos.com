// B"H

import { repairTriangleGeometry } from "../repairTriangleGeometry.js";
import { createTriangleRepairPlan } from "../plans/createTriangleRepairPlan.js";
import { createIdentityTransition } from "./createIdentityTransition.js";
import { assertTopologyIdentityMatchesGeometry } from "./identityContract.js";

/** Repairs geometry while explicitly naming every surviving and removed element. */
export function repairGeometryWithIdentity(geometry, sourceIdentity, options = {}) {
	assertTopologyIdentityMatchesGeometry(sourceIdentity, geometry);
	const plan = options.plan ?? createTriangleRepairPlan(geometry, options);
	const targetGeometry = repairTriangleGeometry(geometry, {
		...options,
		id: options.id ?? geometry.id,
		plan
	});
	const transition = createIdentityTransition({
		operation: "repair_geometry",
		sourceGeometry: geometry,
		sourceIdentity,
		targetGeometry,
		vertexTargetBySource: plan.vertexTargetBySource,
		faceTargetBySource: plan.faceTargetBySource,
		metadata: options.identityMetadata,
		remapMetadata: options.remapMetadata
	});
	return Object.freeze({ geometry: targetGeometry, ...transition });
}
