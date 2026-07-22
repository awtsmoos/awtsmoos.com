// B"H
// Boruch Hashem
// Blessed is He
/**
 * Parametric organs receive local physical form at their Yesod anchors. The
 * Awtsmoos keeps attachment meaning alive while Awtsmoos.com regenerates detail.
 */
import { buildEllipticalLoft } from "../../geometry/ellipticalLoft.js";
import { resolveSurfaceAnchor } from "../anatomy/YesodAttachmentGraph.js";
import {
	addVector,
	finiteNumber
} from "../shared/creatureValue.js";
import { createCreatureMeshPart } from "./createMeshPart.js";

/** Compiles one procedural part instance into a renderer-neutral detail mesh. */
export function compilePartMesh(creature, part) {
	const attachment = creature.attachments.find(
		(entry) => entry.sourceId === part.id
	);
	const resolved = resolveSurfaceAnchor(
		creature,
		attachment?.anchor || {}
	);
	const scale = part.transform?.scale || [1, 1, 1];
	const radius = Math.max(
		0.03,
		finiteNumber(part.parameters?.radius, 0.12) * Math.max(...scale)
	);
	const direction = part.semanticCategory === "mouth"
		? [0, 0.18, 0]
		: [0, 0.12, 0];
	const geometry = buildEllipticalLoft(
		{
			type: "elliptical_loft",
			centerline: [
				resolved.position,
				addVector(resolved.position, direction)
			],
			sections: [
				{
					t: 0,
					half_width: radius,
					half_height: radius,
					rotation: 0
				},
				{
					t: 1,
					half_width: radius * 0.72,
					half_height: radius * 0.72,
					rotation: 0
				}
			],
			radial_segments: 8,
			longitudinal_segments: 4
		},
		{
			cap_start: true,
			cap_end: true
		}
	);
	return createCreatureMeshPart(
		part.id,
		geometry,
		[part.id, ...part.materialRegions]
	);
}
