// B"H
// Boruch Hashem
// Blessed is He
/**
 * Each appendage descends as a semantic chain. The Awtsmoos lets Awtsmoos.com
 * form a foot, hand, fin, wing, branch, or tentacle from the same honest law.
 */
import { createYetzirahBone } from "./boneFactory.js";
import {
	addVector,
	normalizeVector,
	scaleVector
} from "../shared/creatureValue.js";

function radialAnchor(creature, limb, section) {
	const radialLimbs = creature.limbs.filter(
		(entry) => Number.isInteger(entry.radialIndex)
	);
	const angle = limb.radialIndex * Math.PI * 2 / Math.max(1, radialLimbs.length);
	return [
		section.position[0] + Math.cos(angle) * section.ellipticalRadius[0],
		section.position[1],
		section.position[2] + Math.sin(angle) * section.ellipticalRadius[1]
	];
}

/** Resolves the stable Briah anchor for one limb. */
export function resolveLimbAnchor(creature, limb) {
	const section = creature.body.sections.find(
		(entry) => entry.id === limb.parentAnatomicalAnchor?.axialSectionId
	) || creature.body.sections[0];
	if (Number.isInteger(limb.radialIndex)) {
		return radialAnchor(creature, limb, section);
	}
	const side = limb.side === "left" ? -1 : limb.side === "right" ? 1 : 0;
	return [
		section.position[0] + side * section.ellipticalRadius[0],
		section.position[1],
		section.position[2]
	];
}

/**
 * Compiles one arbitrary semantic limb chain.
 * Complexity: O(g). Stable IDs survive when segment IDs survive.
 */
export function compileLimbBones(creature, limb, sectionBoneIds) {
	let head = resolveLimbAnchor(creature, limb);
	let parentBoneId = sectionBoneIds.get(
		limb.parentAnatomicalAnchor?.axialSectionId
	) || [...sectionBoneIds.values()][0] || null;
	return limb.segments.map((segment, index) => {
		const tail = addVector(
			head,
			scaleVector(normalizeVector(segment.restDirection), segment.length)
		);
		const bone = createYetzirahBone(
			segment.id,
			`${limb.functionalRole}.segment.${index + 1}`,
			parentBoneId,
			head,
			tail,
			{
				radius: (segment.radiusStart + segment.radiusEnd) * 0.5,
				jointConstraints: {
					type: segment.jointType,
					angularLimits: segment.angularLimits
				},
				preferredPose: {
					bendDirection: segment.preferredBendDirection,
					twist: 0
				},
				twistLimits: segment.twistLimits,
				stretchPolicy: {
					minimum: segment.stretchLimits[0],
					maximum: segment.stretchLimits[1]
				},
				skinningRegion: limb.id,
				retargetingRole: limb.functionalRole
			}
		);
		head = tail;
		parentBoneId = bone.id;
		return bone;
	});
}
