// B"H
// Boruch Hashem
// Blessed is He

import { cloneCreatureValue } from "./clone.js";
import { CreatureOperationError } from "./contracts.js";
import { createSemanticId } from "./identity.js";

function requirePart(creature, partId) {
	const part = creature.parts.find((candidate) => candidate.id === partId);
	if (!part) {
		throw new CreatureOperationError("CREATURE_PART_NOT_FOUND", `Unknown part: ${partId}`);
	}
	return part;
}

function createAttachment(creature, part, options) {
	const anchor = {
		id: options.surfaceAnchorId || createSemanticId("surface-anchor", creature.id, part.id),
		partId: part.id,
		axialPosition: Number(options.axialPosition ?? 0.5),
		angularPosition: Number(options.angularPosition ?? 0),
		radialOffset: Number(options.radialOffset ?? 0),
		anatomicalLandmark: options.anatomicalLandmark || null,
		bodyRegion: options.attachmentRegion || options.bodyRegion || "torso",
		transportedFrame: options.transportedFrame || { tangent: [1, 0, 0], normal: [0, 1, 0], binormal: [0, 0, 1] },
		limbSegmentParameter: options.limbSegmentParameter || null,
		partSocket: options.partSocket || null
	};
	creature.attachments.push(anchor);
	part.attachmentId = anchor.id;
	return anchor;
}

/**
 * Applies semantic catalog-part edits. A horn, eye, mouth, fin, or decorative
 * plate remains a reusable definition whose attachment contract—not a hardcoded
 * vertex—determines where its vessel appears.
 * @param {Object} creature - Transaction-local Briah document.
 * @param {string} operation - Part operation name.
 * @param {Object} argumentsValue - Part and anchor arguments.
 * @returns {Object} Edited part state.
 */
export function applyPartOperation(creature, operation, argumentsValue = {}) {
	if (operation === "creature.part.attach") {
		const part = {
			id: argumentsValue.id || createSemanticId("part", creature.id, creature.revision, creature.parts.length, argumentsValue.definitionId),
			definitionId: argumentsValue.definitionId,
			definitionVersion: argumentsValue.definitionVersion || "1.0.0",
			category: argumentsValue.category || argumentsValue.definitionId?.split(".")[1] || "detail",
			parameters: cloneCreatureValue(argumentsValue.parameters || {}),
			transform: cloneCreatureValue(argumentsValue.transform || { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] }),
			behavioralRoles: [...(argumentsValue.behavioralRoles || [])],
			capabilities: cloneCreatureValue(argumentsValue.capabilities || {}),
			rigContribution: cloneCreatureValue(argumentsValue.rigContribution || null),
			materialRegion: argumentsValue.materialRegion || `part.${argumentsValue.category || "detail"}`,
			parentPartId: argumentsValue.parentPartId || null,
			stackIndex: Number(argumentsValue.stackIndex || 0)
		};
		creature.parts.push(part);
		return { part, attachment: createAttachment(creature, part, argumentsValue) };
	}
	if (operation === "creature.part.remove") {
		creature.parts = creature.parts.filter((part) => part.id !== argumentsValue.partId);
		creature.attachments = creature.attachments.filter((anchor) => anchor.partId !== argumentsValue.partId);
		return { removedPartId: argumentsValue.partId };
	}
	const part = requirePart(creature, argumentsValue.partId);
	if (operation === "creature.part.detach") {
		creature.attachments = creature.attachments.filter((anchor) => anchor.partId !== part.id);
		part.attachmentId = null;
	} else if (operation === "creature.part.clone") {
		const clone = cloneCreatureValue(part);
		clone.id = createSemanticId("part", creature.id, creature.revision, part.id, creature.parts.length);
		creature.parts.push(clone);
		createAttachment(creature, clone, argumentsValue);
		return { part: clone };
	} else if (operation === "creature.part.move") {
		part.transform.position = [...argumentsValue.position];
	} else if (operation === "creature.part.rotate") {
		part.transform.rotation = [...argumentsValue.rotation];
	} else if (operation === "creature.part.scale") {
		part.transform.scale = [...argumentsValue.scale];
	} else if (operation === "creature.part.parameter.set") {
		part.parameters[argumentsValue.parameter] = cloneCreatureValue(argumentsValue.value);
	} else if (operation === "creature.part.reparent") {
		part.parentPartId = argumentsValue.parentPartId || null;
	} else if (operation === "creature.part.stack") {
		part.stackIndex = Number(argumentsValue.stackIndex);
	} else if (operation === "creature.part.snap") {
		const anchor = creature.attachments.find((candidate) => candidate.partId === part.id);
		Object.assign(anchor, cloneCreatureValue(argumentsValue.anchor || {}));
	} else if (operation !== "creature.part.validate") {
		throw new CreatureOperationError("CREATURE_PART_OPERATION_UNKNOWN", `Unsupported part operation: ${operation}`);
	}
	return { part };
}
