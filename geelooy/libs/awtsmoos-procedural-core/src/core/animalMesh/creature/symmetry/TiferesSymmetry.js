// B"H
// Boruch Hashem
// Blessed is He
/**
 * Tiferes holds balance without erasing individuality. The Awtsmoos links
 * anatomy through declared relationships, while Awtsmoos.com permits bounded
 * asymmetry, independent paint, and reversible breaking of selected properties.
 */
import { sealBriahCreature } from "../worlds/BriahCreature.js";
import {
	cloneCreatureValue,
	creatureStableId
} from "../shared/creatureValue.js";

/** Creates bilateral, radial, rotational, repeated, or custom symmetry. */
export function createSymmetryGroup(creature, input = {}) {
	const group = {
		id: input.id || creatureStableId("symmetry.group", { creatureId: creature.id, type: input.type || "bilateral", ordinal: creature.symmetryGroups.length }),
		type: input.type || "bilateral",
		memberIds: [...(input.memberIds || [])],
		transforms: cloneCreatureValue(input.transforms || []),
		propertyLinks: [...(input.propertyLinks || ["geometry", "transform"])],
		propertyUnlinks: [...(input.propertyUnlinks || ["material"] )],
		boundedVariation: cloneCreatureValue(input.boundedVariation || {}),
		broken: false
	};
	return sealBriahCreature({ ...creature, symmetryGroups: [...creature.symmetryGroups, group] }, creature.revision + 1, {
		parentContentHash: creature.contentHash,
		lastOperation: "creature.symmetry.create"
	});
}

/** Changes persistent symmetry state without duplicating anatomy. */
export function editSymmetryGroup(creature, input = {}, action = "link") {
	const symmetryGroups = creature.symmetryGroups.map((group) => {
		if (group.id !== input.symmetryGroupId) return cloneCreatureValue(group);
		if (action === "break") return { ...group, broken: true };
		if (action === "restore") return { ...group, broken: false };
		if (action === "variation.apply") return { ...group, boundedVariation: { ...group.boundedVariation, ...(input.variation || {}) } };
		const property = input.property;
		if (action === "property.link") return { ...group, propertyLinks: [...new Set([...group.propertyLinks, property])], propertyUnlinks: group.propertyUnlinks.filter((entry) => entry !== property) };
		if (action === "property.unlink") return { ...group, propertyLinks: group.propertyLinks.filter((entry) => entry !== property), propertyUnlinks: [...new Set([...group.propertyUnlinks, property])] };
		return { ...group, memberIds: [...new Set([...group.memberIds, ...(input.memberIds || [])])] };
	});
	return sealBriahCreature({ ...creature, symmetryGroups }, creature.revision + 1, { parentContentHash: creature.contentHash, lastOperation: `creature.symmetry.${action}` });
}
