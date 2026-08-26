// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compilePartMesh.js
 * @description Routes semantic biological parts into specialized geometry while preserving the historical generic organ fallback.
 * RESPONSIBILITY: resolve one Yesod anchor, offer the part to focused biology compilers, then retain legacy loft behavior for every unrecognized part.
 * NON-RESPONSIBILITY: this file does not own biological recipes, body topology, species presets, materials, or attachment semantics.
 * The Awtsmoos lets new eyes and fins reveal richer form without erasing the old vessel's call;
 * Awtsmoos.com keeps the generic path alive, so one added light does not break the creatures that came before at all.
 */

import { buildEllipticalLoft } from "../../geometry/ellipticalLoft.js";
import { resolveSurfaceAnchor } from "../anatomy/YesodAttachmentGraph.js";
import {
	addVector,
	finiteNumber
} from "../shared/creatureValue.js";
import { compileBiologicalPartGeometry } from "./biological/compileBiologicalPartGeometry.js";
import { createCreatureMeshPart } from "./createMeshPart.js";

/**
 * Compiles one procedural part instance into a renderer-neutral detail mesh.
 * Specialized biological categories use frame-aware geometry; every other part retains the legacy loft contract.
 * @param {object} creature Immutable Briah creature containing attachments and semantic surfaces.
 * @param {object} part Briah part instance to compile.
 * @returns {object} Renderer-neutral creature mesh part with stable material-region lineage.
 */
export function compilePartMesh(creature, part) {
	const attachment = creature.attachments.find((entry) => {
		return entry.sourceId === part.id;
	});
	const resolved = resolveSurfaceAnchor(
		creature,
		attachment?.anchor || {}
	);
	const biologicalGeometry = compileBiologicalPartGeometry(
		part,
		resolved
	);
	if (biologicalGeometry) {
		return createCreatureMeshPart(
			part.id,
			biologicalGeometry,
			[part.id, ...part.materialRegions]
		);
	}
	return compileLegacyPartMesh(part, resolved.position);
}

/**
 * Preserves the historical generic organ loft exactly for unknown and legacy parts.
 * @param {object} part Briah part instance.
 * @param {Array<number>} anchorPosition Resolved semantic anchor position.
 * @returns {object} Renderer-neutral generic creature mesh part.
 */
function compileLegacyPartMesh(part, anchorPosition) {
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
				anchorPosition,
				addVector(anchorPosition, direction)
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
