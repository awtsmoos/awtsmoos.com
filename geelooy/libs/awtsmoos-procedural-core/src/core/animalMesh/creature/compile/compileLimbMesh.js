// B"H
// Boruch Hashem
// Blessed is He
/**
 * Limbs become swept geometry only after their articulated meaning is complete.
 * The Awtsmoos reveals each segment; Awtsmoos.com keeps its stable ID on output.
 */
import { buildEllipticalLoft } from "../../geometry/ellipticalLoft.js";
import {
	addVector,
	scaleVector
} from "../shared/creatureValue.js";
import { resolveLimbAnchor } from "../rig/compileLimbBones.js";
import { createCreatureMeshPart } from "./createMeshPart.js";

/** Compiles one semantic limb chain into a lofted renderer-neutral mesh. */
export function compileLimbMesh(creature, descriptor) {
	const limb = descriptor.source;
	let point = resolveLimbAnchor(creature, limb);
	const centerline = [[...point]];
	for (const segment of limb.segments) {
		point = addVector(
			point,
			scaleVector(segment.restDirection, segment.length)
		);
		centerline.push([...point]);
	}
	const first = limb.segments[0];
	const sections = [
		{
			t: 0,
			half_width: first.radiusStart,
			half_height: first.radiusStart,
			rotation: 0
		},
		...limb.segments.map((segment, index) => ({
			t: (index + 1) / limb.segments.length,
			half_width: segment.radiusEnd,
			half_height: segment.radiusEnd,
			rotation: 0
		}))
	];
	const geometry = buildEllipticalLoft(
		{
			type: "elliptical_loft",
			centerline,
			sections,
			radial_segments: descriptor.radial_segments,
			longitudinal_segments: Math.max(4, limb.segments.length * 4)
		},
		{
			cap_start: true,
			cap_end: true
		}
	);
	return createCreatureMeshPart(
		limb.id,
		geometry,
		[
			limb.id,
			...limb.segments.map((segment) => segment.id)
		]
	);
}
