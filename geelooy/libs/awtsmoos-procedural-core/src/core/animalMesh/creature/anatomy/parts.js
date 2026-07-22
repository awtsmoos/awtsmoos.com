// B"H
// Boruch Hashem
// Blessed is He
/**
 * Catalog parts are procedural organs with contracts, not frozen ornaments.
 * The Awtsmoos permits a horn to serve wherever its domain allows, while
 * Awtsmoos.com preserves definition, socket, capability, and lineage.
 */
import { sealBriahCreature } from "../worlds/BriahCreature.js";
import { createSurfaceAnchor } from "./YesodAttachmentGraph.js";
import {
	cloneCreatureValue,
	creatureStableId,
	vector3
} from "../shared/creatureValue.js";

function categoryFromDefinition(definitionId = "part.decorative.custom") {
	return definitionId.split(".")[1] || "decorative";
}

/** Attaches a parameterized part instance to a semantic anchor. */
export function attachCreaturePart(creature, input = {}) {
	const definitionId = input.partDefinitionId || input.definitionId || "part.decorative.custom";
	const id = input.id || creatureStableId("part.instance", { creatureId: creature.id, definitionId, ordinal: input.ordinal ?? creature.parts.length });
	const anchor = createSurfaceAnchor(creature, input.anchor || input);
	const part = {
		id,
		definitionId,
		definitionVersion: input.definitionVersion || "1.0.0",
		semanticCategory: input.semanticCategory || categoryFromDefinition(definitionId),
		parameters: cloneCreatureValue(input.parameters || {}),
		anchorId: anchor.id,
		transform: cloneCreatureValue(input.transform || { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }),
		rigContribution: cloneCreatureValue(input.rigContribution || {}),
		skinningContribution: cloneCreatureValue(input.skinningContribution || {}),
		contactRegions: cloneCreatureValue(input.contactRegions || []),
		collision: cloneCreatureValue(input.collision || {}),
		materialRegions: cloneCreatureValue(input.materialRegions || ["part.default"]),
		animationControls: cloneCreatureValue(input.animationControls || []),
		functionalCapabilities: cloneCreatureValue(input.functionalCapabilities || {})
	};
	const attachment = {
		id: creatureStableId("yesod.attachment", { creatureId: creature.id, sourceId: id, anchorId: anchor.id }),
		sourceId: id,
		anchorId: anchor.id,
		parentAnatomyId: anchor.axialSectionId,
		orientationRule: input.orientationRule || "follow-transported-frame",
		localTransform: part.transform,
		anchor
	};
	return sealBriahCreature({ ...creature, parts: [...creature.parts, part], attachments: [...creature.attachments, attachment] }, creature.revision + 1, {
		parentContentHash: creature.contentHash,
		lastOperation: "creature.part.attach"
	});
}

/** Removes a part and its dependent attachment edges. */
export function removeCreaturePart(creature, input = {}) {
	return sealBriahCreature({
		...creature,
		parts: creature.parts.filter((part) => part.id !== input.partId),
		attachments: creature.attachments.filter((attachment) => attachment.sourceId !== input.partId)
	}, creature.revision + 1, { parentContentHash: creature.contentHash, lastOperation: "creature.part.remove" });
}

/** Applies a semantic transform or parameter mutation to a part. */
export function editCreaturePart(creature, input = {}, action = "move") {
	const parts = creature.parts.map((part) => {
		if (part.id !== input.partId) return cloneCreatureValue(part);
		if (action === "parameter.set") return { ...part, parameters: { ...part.parameters, [input.name]: cloneCreatureValue(input.value) } };
		const transform = cloneCreatureValue(part.transform);
		if (action === "move") transform.position = vector3(input.position, transform.position);
		if (action === "rotate") transform.rotation = vector3(input.rotation, transform.rotation);
		if (action === "scale") transform.scale = vector3(input.scale, transform.scale);
		return { ...part, transform };
	});
	return sealBriahCreature({ ...creature, parts }, creature.revision + 1, { parentContentHash: creature.contentHash, lastOperation: `creature.part.${action}` });
}
