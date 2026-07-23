// B"H
// Boruch Hashem
// Blessed is He
/** A tapered sweep path is the mesh-ready vessel of stems, roots, bones, muscles, and hyphae. */

import { createStableId } from "../../foundation/artifacts/index.js";
import {
	biologicalMetadata3d,
	biologicalRecordId3d
} from "./biologicalRecordHelpers3d.js";
import { biologicalVector3d } from "./biologicalVectorMath3d.js";

function sweepPoint(input, index) {
	const radius = Number(input.radius);
	if (!Number.isFinite(radius) || radius < 0) {
		throw new TypeError(`Biological sweep radius must be nonnegative at point ${index}.`);
	}
	return Object.freeze({
		position: biologicalVector3d(input.position, undefined, `Sweep point ${index}`),
		radius,
		twist: Number.isFinite(Number(input.twist)) ? Number(input.twist) : 0,
		metadata: biologicalMetadata3d(input.metadata)
	});
}

export function createBiologicalSweep3d(input) {
	const points = (input?.points ?? []).map(sweepPoint);
	if (points.length < 2) throw new RangeError("Biological sweep requires at least two points.");
	const radialSegments = Math.max(3, Math.floor(Number(input.radialSegments ?? 8)));
	const content = Object.freeze({
		organId: biologicalRecordId3d(input.organId, "Biological sweep organ id"),
		profile: String(input.profile ?? "circular"),
		points: Object.freeze(points),
		radialSegments,
		closed: input.closed === true,
		materialSlot: input.materialSlot == null ? null : String(input.materialSlot),
		metadata: biologicalMetadata3d(input.metadata)
	});
	return Object.freeze({
		id: input.id == null
			? createStableId("biological.sweep", content)
			: biologicalRecordId3d(input.id, "Biological sweep id"),
		...content
	});
}
