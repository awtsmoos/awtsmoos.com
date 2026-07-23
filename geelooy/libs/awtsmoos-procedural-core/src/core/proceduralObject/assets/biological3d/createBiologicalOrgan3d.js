// B"H
// Boruch Hashem
// Blessed is He
/** An organ joins hierarchy, spatial frame, developmental time, material, and semantic role. */

import { createStableId } from "../../foundation/artifacts/index.js";
import {
	biologicalGrowthWindow3d,
	biologicalMetadata3d,
	biologicalRecordId3d,
	biologicalScaleVector3d
} from "./biologicalRecordHelpers3d.js";
import { biologicalFrame3d } from "./biologicalVectorMath3d.js";

export function createBiologicalOrgan3d(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Biological organ must be an object.");
	}
	const role = biologicalRecordId3d(input.role ?? input.type, "Biological organ role");
	const content = Object.freeze({
		type: biologicalRecordId3d(input.type ?? role, "Biological organ type"),
		role,
		parentId: input.parentId == null
			? null
			: biologicalRecordId3d(input.parentId, "Biological organ parent id"),
		side: input.side == null ? "center" : String(input.side),
		frame: biologicalFrame3d(input.frame),
		scale: biologicalScaleVector3d(input.scale),
		growth: biologicalGrowthWindow3d(input.growth),
		materialSlot: input.materialSlot == null ? null : String(input.materialSlot),
		metadata: biologicalMetadata3d(input.metadata)
	});
	return Object.freeze({
		id: input.id == null
			? createStableId("biological.organ", content)
			: biologicalRecordId3d(input.id, "Biological organ id"),
		...content
	});
}
