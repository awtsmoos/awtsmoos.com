// B"H
// Boruch Hashem
// Blessed is He
/**
 * The axial graph is the river of the creature. The Awtsmoos bends the river
 * without losing its named banks, so Awtsmoos.com anchors follow living form.
 */
import { sealBriahCreature } from "../worlds/BriahCreature.js";
import {
	boundedNumber,
	cloneCreatureValue,
	creatureStableId,
	finiteNumber,
	vector3
} from "../shared/creatureValue.js";

function sectionFromInput(creature, input, ordinal) {
	return {
		id: input.id || creatureStableId("axis.section", { creatureId: creature.id, ordinal, seed: input.identity || input.position }),
		position: vector3(input.position),
		ellipticalRadius: [Math.max(0.01, finiteNumber(input.ellipticalRadius?.[0], 0.4)), Math.max(0.01, finiteNumber(input.ellipticalRadius?.[1], 0.32))],
		roll: finiteNumber(input.roll, 0),
		taper: boundedNumber(input.taper, 0.01, 4, 1),
		stiffness: boundedNumber(input.stiffness, 0, 1, 0.5),
		massContribution: Math.max(0, finiteNumber(input.massContribution, 1)),
		surfaceProfile: input.surfaceProfile || "elliptical",
		anatomicalTags: [...(input.anatomicalTags || [])],
		materialRegion: input.materialRegion || "body.base",
		localDeformationLimits: cloneCreatureValue(input.localDeformationLimits || { bend: 0.75, stretch: 1.5, compression: 0.55 })
	};
}

function revise(creature, body, operation) {
	return sealBriahCreature({ ...creature, body }, creature.revision + 1, {
		parentContentHash: creature.contentHash,
		lastOperation: operation
	});
}

/** Creates or replaces the primary axial body graph. */
export function createAxialBody(creature, input = {}) {
	const sections = (input.sections || []).map((section, index) => sectionFromInput(creature, section, index));
	if (sections.length < 2) throw new RangeError("B\"H | An axial body requires at least two sections.");
	return revise(creature, { axialGraphId: input.axialGraphId || creature.body.axialGraphId, sections, branches: cloneCreatureValue(input.branches || []) }, "creature.body.create");
}

/** Inserts one stable cross-section without invalidating surviving IDs. */
export function insertAxialSection(creature, input = {}) {
	const sections = cloneCreatureValue(creature.body.sections);
	const index = Math.max(0, Math.min(sections.length, Number.isInteger(input.index) ? input.index : sections.length));
	sections.splice(index, 0, sectionFromInput(creature, input.section || input, input.ordinal || `${creature.revision}:${index}`));
	return revise(creature, { ...creature.body, sections }, "creature.body.section.insert");
}

/** Removes a section while returning its stable identity in provenance. */
export function removeAxialSection(creature, input = {}) {
	if (creature.body.sections.length <= 2) throw new RangeError("B\"H | The primary axis must retain two sections.");
	const sections = creature.body.sections.filter((section) => section.id !== input.sectionId);
	if (sections.length === creature.body.sections.length) throw new Error(`B\"H | Unknown axial section: ${input.sectionId}`);
	return revise(creature, { ...creature.body, sections }, "creature.body.section.remove");
}

/** Moves, scales, or rolls one section through semantic parameters. */
export function transformAxialSection(creature, input = {}, mode = "move") {
	const sections = creature.body.sections.map((section) => {
		if (section.id !== input.sectionId) return cloneCreatureValue(section);
		if (mode === "move") return { ...section, position: vector3(input.position, section.position) };
		if (mode === "scale") {
			const scale = Array.isArray(input.scale) ? input.scale : [input.scale, input.scale];
			return { ...section, ellipticalRadius: section.ellipticalRadius.map((radius, index) => Math.max(0.01, radius * finiteNumber(scale[index], 1))) };
		}
		return { ...section, roll: finiteNumber(input.roll ?? input.rotation, section.roll) };
	});
	return revise(creature, { ...creature.body, sections }, `creature.body.section.${mode}`);
}

/** Applies bend, taper, or stretch to a bounded axial region. */
export function deformAxialRegion(creature, input = {}, mode = "bend") {
	const ids = new Set(input.sectionIds || creature.body.sections.map((section) => section.id));
	const amount = finiteNumber(input.amount, mode === "stretch" ? 1 : 0);
	const sections = creature.body.sections.map((section, index) => {
		if (!ids.has(section.id)) return cloneCreatureValue(section);
		if (mode === "bend") return { ...section, position: [section.position[0] + amount * index, section.position[1], section.position[2]] };
		if (mode === "taper") return { ...section, ellipticalRadius: section.ellipticalRadius.map((radius) => Math.max(0.01, radius * amount)) };
		return { ...section, position: section.position.map((value, axis) => axis === 1 ? value * amount : value) };
	});
	return revise(creature, { ...creature.body, sections }, `creature.body.region.${mode}`);
}
