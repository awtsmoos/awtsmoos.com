// B"H
// Boruch Hashem
// Blessed is He
/**
 * The axial chain is formed from Briah sections without assuming pelvis, chest,
 * or humanoid proportions. The Awtsmoos gives each surviving section the same
 * Awtsmoos.com bone identity after bending, widening, or stretching.
 */
import { createCreatureId } from "../foundation/value.js";
import { createSemanticBone } from "./SkeletonPrimitives.js";
/** Compiles stable axial bones in O(section count). */
export function compileAxialBones(creature, axis, rootId) {
	return axis.sections.map((section, index) => {
		const next = axis.sections[index + 1];
		const tail = next?.position || section.position.map((value, axisIndex) => (
			value + (axisIndex === 1 ? 0.1 : 0)
		));
		return createSemanticBone({
			id: createCreatureId("bone", { creatureId: creature.id, sourceAnatomyId: section.id }),
			parentBoneId: index
				? createCreatureId("bone", { creatureId: creature.id, sourceAnatomyId: axis.sections[index - 1].id })
				: rootId,
			semanticRole: `axis.${axis.role}`,
			sourceAnatomyId: section.id,
			head: section.position,
			tail,
			radius: Math.min(...section.ellipticalRadius) * 0.35,
			jointConstraints: {
				type: "ball",
				angular: { minimum: -45, maximum: 45 },
				twist: { minimum: -30, maximum: 30 },
				stretch: { minimum: 0.95, maximum: 1.05 }
			},
			skinningRegion: section.materialRegion
		});
	});
}
