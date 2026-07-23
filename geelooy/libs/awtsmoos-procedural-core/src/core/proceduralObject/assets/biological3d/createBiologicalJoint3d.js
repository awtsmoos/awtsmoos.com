// B"H
// Boruch Hashem
// Blessed is He
/** A joint binds anatomical hierarchy to finite axes, limits, and semantic sides. */

import { createStableId } from "../../foundation/artifacts/index.js";
import {
	biologicalMetadata3d,
	biologicalRecordId3d
} from "./biologicalRecordHelpers3d.js";
import { biologicalNormalize3d, biologicalVector3d } from "./biologicalVectorMath3d.js";

function limits3d(value = [-Math.PI, Math.PI]) {
	if (!Array.isArray(value) || value.length !== 2) {
		throw new TypeError("Biological joint limits must contain minimum and maximum.");
	}
	const limits = value.map(Number);
	if (limits.some(limit => !Number.isFinite(limit)) || limits[1] < limits[0]) {
		throw new TypeError("Biological joint limits must be finite and ordered.");
	}
	return Object.freeze(limits);
}

export function createBiologicalJoint3d(input) {
	const content = Object.freeze({
		organId: biologicalRecordId3d(input?.organId, "Biological joint organ id"),
		parentJointId: input.parentJointId == null
			? null
			: biologicalRecordId3d(input.parentJointId, "Parent joint id"),
		role: biologicalRecordId3d(input.role, "Biological joint role"),
		side: input.side == null ? "center" : String(input.side),
		position: biologicalVector3d(input.position, undefined, "Joint position"),
		axis: biologicalNormalize3d(
			biologicalVector3d(input.axis, [1, 0, 0], "Joint axis")
		),
		limits: limits3d(input.limits),
		metadata: biologicalMetadata3d(input.metadata)
	});
	return Object.freeze({
		id: input.id == null
			? createStableId("biological.joint", content)
			: biologicalRecordId3d(input.id, "Biological joint id"),
		...content
	});
}
