// B"H
// Boruch Hashem
// Blessed is He
/** An instance anchor repeats leaves, petals, scales, feathers, eyes, spores, and horns. */

import { createStableId } from "../../foundation/artifacts/index.js";
import {
	biologicalGrowthWindow3d,
	biologicalMetadata3d,
	biologicalRecordId3d,
	biologicalScaleVector3d
} from "./biologicalRecordHelpers3d.js";
import { biologicalFrame3d } from "./biologicalVectorMath3d.js";

export function createBiologicalInstance3d(input) {
	const content = Object.freeze({
		organId: biologicalRecordId3d(input?.organId, "Biological instance organ id"),
		prototype: biologicalRecordId3d(input?.prototype, "Biological prototype"),
		frame: biologicalFrame3d(input.frame),
		scale: biologicalScaleVector3d(input.scale),
		growth: biologicalGrowthWindow3d(input.growth),
		materialSlot: input.materialSlot == null ? null : String(input.materialSlot),
		metadata: biologicalMetadata3d(input.metadata)
	});
	return Object.freeze({
		id: input.id == null
			? createStableId("biological.instance", content)
			: biologicalRecordId3d(input.id, "Biological instance id"),
		...content
	});
}
