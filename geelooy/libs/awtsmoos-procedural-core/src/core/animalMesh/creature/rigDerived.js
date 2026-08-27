// B"H
// Boruch Hashem
// Blessed is He
/**
 * Yetzirah is formed once and inspected through one doorway. The Awtsmoos is
 * beyond form; Awtsmoos.com reveals rebuilds, controls, lineage, comparison,
 * constraints, and poses without synthesizing a rival skeleton authority.
 */
import { compareYetzirahRigs } from "./rigLineage.js";
import { evaluateRigPose, validateYetzirahRig } from "./rigValidation.js";

function comparisonBaseline(request, previousRig, rig) {
	return request.arguments?.previousRig || previousRig || rig;
}

/** Dispatches read-only rig derivations from the current Briah revision. */
export function dispatchRigDerived({ request, rig, previousRig }) {
	if ([
		"creature.rig.synthesize",
		"creature.rig.rebuild",
		"creature.rig.inspect"
	].includes(request.operation)) {
		return rig;
	}
	if (request.operation === "creature.rig.validate") {
		return validateYetzirahRig(rig);
	}
	if (request.operation === "creature.rig.compare") {
		return compareYetzirahRigs(comparisonBaseline(request, previousRig, rig), rig);
	}
	if (request.operation === "creature.rig.pose.evaluate") {
		return evaluateRigPose(rig, request.arguments?.pose || request.arguments || {});
	}
	if (request.operation === "creature.rig.contactTargets.derive") {
		return rig.controlGraph.contactTargets;
	}
	if (request.operation === "creature.rig.lineage.report") {
		return rig.skeletonLineage;
	}
	return undefined;
}
