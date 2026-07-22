// B"H
// Boruch Hashem
// Blessed is He
/**
 * A limb is one articulated sentence, not scattered meshes. The Awtsmoos
 * speaks each joint with limits and purpose so Awtsmoos.com may form feet,
 * wings, fins, manipulators, or tentacles through one truthful chain contract.
 */
import { sealBriahCreature } from "../worlds/BriahCreature.js";
import {
	cloneCreatureValue,
	creatureStableId,
	finiteNumber,
	normalizeVector
} from "../shared/creatureValue.js";

function segment(chainId, input, index) {
	return {
		id: input.id || creatureStableId("limb.segment", { chainId, index }),
		length: Math.max(0.01, finiteNumber(input.length, 0.65)),
		radiusStart: Math.max(0.005, finiteNumber(input.radiusStart, 0.14)),
		radiusEnd: Math.max(0.005, finiteNumber(input.radiusEnd, 0.09)),
		restDirection: normalizeVector(input.restDirection || [0, -1, 0]),
		jointType: input.jointType || "ball",
		angularLimits: cloneCreatureValue(input.angularLimits || { swing: [-0.9, 0.9], twist: [-0.45, 0.45] }),
		preferredBendDirection: normalizeVector(input.preferredBendDirection || [0, 0, 1]),
		twistLimits: cloneCreatureValue(input.twistLimits || [-0.45, 0.45]),
		stretchLimits: cloneCreatureValue(input.stretchLimits || [0.85, 1.15])
	};
}

function createChain(creature, input, side, radialIndex) {
	const id = input.id || creatureStableId("limb.chain", {
		creatureId: creature.id,
		role: input.role || "locomotion.support",
		side,
		radialIndex,
		ordinal: input.ordinal ?? creature.limbs.length
	});
	const segments = (input.segments?.length ? input.segments : [{}, {}]).map((entry, index) => segment(id, entry, index));
	return {
		id,
		parentAnatomicalAnchor: cloneCreatureValue(input.parentAnatomicalAnchor || { axialSectionId: input.axialSectionId || creature.body.sections[0]?.id, axialPosition: input.axialPosition ?? 0.5 }),
		functionalRole: input.role || "locomotion.support",
		side,
		radialIndex,
		joints: segments.map((entry, index) => ({ id: creatureStableId("limb.joint", { chainId: id, index }), type: entry.jointType, limits: entry.angularLimits })),
		segments,
		contactCapabilities: [...(input.contactCapabilities || (String(input.role).includes("support") ? ["ground.support"] : []))],
		manipulationCapabilities: [...(input.manipulationCapabilities || [])],
		locomotionImportance: Math.max(0, finiteNumber(input.locomotionImportance, String(input.role).includes("support") ? 1 : 0.25)),
		collisionExclusions: [...(input.collisionExclusions || [])],
		symmetryRelationship: input.symmetryRelationship || null,
		endpointSocket: cloneCreatureValue(input.endpointSocket || null)
	};
}

function revise(creature, limbs, operation, symmetryGroups = creature.symmetryGroups) {
	return sealBriahCreature({ ...creature, limbs, symmetryGroups }, creature.revision + 1, {
		parentContentHash: creature.contentHash,
		lastOperation: operation
	});
}

/** Creates one semantic articulated chain. */
export function createLimb(creature, input = {}) {
	const chain = createChain(creature, input, input.side || "center", input.radialIndex ?? null);
	return revise(creature, [...creature.limbs, chain], "creature.limb.create");
}

/** Creates a bilateral pair linked by persistent Tiferes symmetry. */
export function createLimbPair(creature, input = {}) {
	const groupId = input.symmetryGroupId || creatureStableId("symmetry.group", { creatureId: creature.id, role: input.role, ordinal: creature.symmetryGroups.length });
	const left = createChain(creature, { ...input, ordinal: `${input.ordinal ?? creature.limbs.length}:left` }, "left", null);
	const right = createChain(creature, { ...input, ordinal: `${input.ordinal ?? creature.limbs.length}:right` }, "right", null);
	left.symmetryRelationship = groupId;
	right.symmetryRelationship = groupId;
	const group = { id: groupId, type: "bilateral", memberIds: [left.id, right.id], propertyLinks: input.propertyLinks || ["segments", "functionalRole"], broken: false, boundedVariation: {} };
	return revise(creature, [...creature.limbs, left, right], "creature.limb.createPair", [...creature.symmetryGroups, group]);
}

/** Mutates one chain through a bounded semantic transformation. */
export function editLimb(creature, input = {}, action = "role.set") {
	const limbs = creature.limbs.map((limb) => {
		if (limb.id !== input.limbId) return cloneCreatureValue(limb);
		if (action === "role.set") return { ...limb, functionalRole: input.role };
		if (action === "endpoint.attach") return { ...limb, endpointSocket: cloneCreatureValue(input.endpointSocket || input) };
		const segments = limb.segments.map((entry) => entry.id === input.segmentId
			? { ...entry, [action.includes("length") ? "length" : "radiusEnd"]: Math.max(0.005, finiteNumber(input.value, action.includes("length") ? entry.length : entry.radiusEnd)) }
			: entry);
		return { ...limb, segments };
	});
	return revise(creature, limbs, `creature.limb.${action}`);
}
