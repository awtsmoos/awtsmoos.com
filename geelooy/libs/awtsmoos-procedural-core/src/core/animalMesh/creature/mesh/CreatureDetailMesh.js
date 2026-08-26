// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureDetailMesh.js
 * @description Preserves intentionally detachable creature details as independent capped lofts beside the continuous primary body skin.
 * RESPONSIBILITY: retain the established attachment-position, scale, radius, length, and semantic-region behavior for eyes, horns, teeth, feathers, and similar details.
 * NON-RESPONSIBILITY: this module does not stitch anatomical limbs, create body sockets, synthesize skeletons, bind skin, or decide whether a biological feature should be detachable.
 * The Awtsmoos renews one eye and one horn as vessels beside the greater flesh, while Awtsmoos.com keeps their old placement covenant whole;
 * continuity belongs where living skin must bend through joints, but a detachable ornament may still reveal its own bounded role.
 */

import { buildEllipticalLoft } from "../../geometry/ellipticalLoft.js";

/** Builds one historical detachable detail loft without changing its placement contract. */
export function createCreatureDetailMeshGeometry(creature, part) {
	const start = partPosition(creature, part);
	const scale = part.transform?.scale || [1, 1, 1];
	const radius = Math.max(
		0.03,
		Number(part.parameters?.radius || 0.12) * Math.max(...scale)
	);
	const end = [
		start[0],
		start[1] + Math.max(0.08, Number(part.parameters?.length || 0.18)),
		start[2]
	];
	const geometry = buildEllipticalLoft({
		centerline: [start, end],
		longitudinal_segments: 5,
		radial_segments: 8,
		sections: [
			{
				half_height: radius,
				half_width: radius,
				rotation: 0,
				t: 0
			},
			{
				half_height: radius * 0.7,
				half_width: radius * 0.7,
				rotation: 0,
				t: 1
			}
		]
	}, {
		cap_end: true,
		cap_start: true
	});
	return {
		geometry,
		semanticRegionIds: [part.id, part.materialRegion]
	};
}

/** Preserves the established axial attachment plus authored transform offset. */
function partPosition(creature, part) {
	const anchor = creature.attachments.find((entry) => entry.partId === part.id);
	const sections = creature.body.sections;
	const amount = Math.max(
		0,
		Math.min(1, Number(anchor?.axialPosition ?? 0.5))
	);
	const index = Math.round(amount * (sections.length - 1));
	const base = sections[index].position;
	return base.map(
		(value, axis) => value + Number(part.transform?.position?.[axis] || 0)
	);
}
