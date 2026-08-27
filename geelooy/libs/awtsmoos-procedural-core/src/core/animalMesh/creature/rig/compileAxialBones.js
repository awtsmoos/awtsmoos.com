// B"H
// Boruch Hashem
// Blessed is He
/**
 * The axial chain is the quiet root of arbitrary bodies. The Awtsmoos forms
 * spine, neck, tailward root, or serpentine continuity without humanoid dogma.
 */
import { createYetzirahBone } from "./boneFactory.js";

/**
 * Compiles stable axial sections into an ordered hierarchy.
 * Complexity: O(s). Determinism: complete. Side effects: none.
 */
export function compileAxialBones(creature) {
	const sections = creature.body.sections;
	const bones = [];
	const sectionBoneIds = new Map();
	for (let index = 0; index < sections.length - 1; index += 1) {
		const section = sections[index];
		const nextSection = sections[index + 1];
		const semanticRole = index === 0
			? "locomotion.root"
			: index === sections.length - 2
				? "axial.neck-head"
				: "axial.spine";
		const bone = createYetzirahBone(
			section.id,
			semanticRole,
			bones.at(-1)?.id || null,
			section.position,
			nextSection.position,
			{
				radius: Math.min(...section.ellipticalRadius) * 0.42,
				skinningRegion: section.materialRegion
			}
		);
		bones.push(bone);
		sectionBoneIds.set(section.id, bone.id);
	}
	sectionBoneIds.set(
		sections.at(-1)?.id,
		bones.at(-1)?.id || null
	);
	return {
		bones,
		sectionBoneIds
	};
}
