// B"H
// Boruch Hashem
// Blessed is He

import { CreatureOperationError } from "./contracts.js";
import { interpolateSection, normalizeBodySection, selectBodySections } from "./bodyHelpers.js";

function requireSection(creature, sectionId) {
	const section = creature.body.sections.find((candidate) => candidate.id === sectionId);
	if (!section) {
		throw new CreatureOperationError("CREATURE_SECTION_NOT_FOUND", `Unknown body section: ${sectionId}`);
	}
	return section;
}

function resampleBody(creature, count) {
	const source = creature.body.sections;
	const targetCount = Math.max(3, Math.floor(count));
	const result = [];
	for (let index = 0; index < targetCount; index += 1) {
		const position = index * (source.length - 1) / (targetCount - 1);
		const leftIndex = Math.floor(position);
		const rightIndex = Math.min(source.length - 1, Math.ceil(position));
		if (leftIndex === rightIndex) {
			result.push({ ...source[leftIndex] });
		} else {
			result.push(interpolateSection(source[leftIndex], source[rightIndex], position - leftIndex, creature.id, index));
		}
	}
	creature.body.sections = result;
}

/**
 * Applies one semantic axial-body edit to a BriahCreature in place.
 * Inputs are anatomical sections and regions, never raw vertices. Geometry is a
 * later Asiyah revelation, while the Briah meaning remains authoritative.
 * @param {Object} creature - Mutable transaction-local Briah document.
 * @param {string} operation - Body operation name.
 * @param {Object} argumentsValue - Validated semantic arguments.
 * @returns {Object} Mutation result and reference report.
 * @complexity O(s), where s is axial section count.
 * @deterministic Always.
 * @sideEffects Mutates only the supplied transaction-local document.
 */
export function applyBodyOperation(creature, operation, argumentsValue = {}) {
	if (operation === "creature.body.create") {
		creature.body.sections = (argumentsValue.sections || []).map((section, index) => normalizeBodySection(section, creature.id, index));
	} else if (operation === "creature.body.section.insert") {
		const index = Math.max(0, Math.min(creature.body.sections.length, argumentsValue.index ?? creature.body.sections.length));
		creature.body.sections.splice(index, 0, normalizeBodySection(argumentsValue.section || argumentsValue, creature.id, index));
	} else if (operation === "creature.body.section.remove") {
		creature.body.sections = creature.body.sections.filter((section) => section.id !== argumentsValue.sectionId);
		if (creature.body.sections.length < 3) {
			throw new CreatureOperationError("CREATURE_BODY_TOO_SHORT", "An axial body requires at least three sections.");
		}
	} else if (operation === "creature.body.section.move") {
		requireSection(creature, argumentsValue.sectionId).position = [...argumentsValue.position];
	} else if (operation === "creature.body.section.scale") {
		const section = requireSection(creature, argumentsValue.sectionId);
		const scale = Array.isArray(argumentsValue.scale) ? argumentsValue.scale : [argumentsValue.scale, argumentsValue.scale];
		section.ellipticalRadius = section.ellipticalRadius.map((value, index) => value * scale[index]);
	} else if (operation === "creature.body.section.rotate") {
		requireSection(creature, argumentsValue.sectionId).roll = Number(argumentsValue.roll || 0);
	} else if (operation === "creature.body.region.bend") {
		selectBodySections(creature, argumentsValue).forEach((section, index) => {
			section.position[1] += Number(argumentsValue.amount || 0) * (index + 1);
			section.roll += Number(argumentsValue.roll || 0);
		});
	} else if (operation === "creature.body.region.taper") {
		const selected = selectBodySections(creature, argumentsValue);
		selected.forEach((section, index) => {
			const ratio = selected.length < 2 ? 1 : index / (selected.length - 1);
			const factor = Number(argumentsValue.startScale ?? 1) + ratio * (Number(argumentsValue.endScale ?? 0.5) - Number(argumentsValue.startScale ?? 1));
			section.ellipticalRadius = section.ellipticalRadius.map((value) => value * factor);
		});
	} else if (operation === "creature.body.region.stretch") {
		const factor = Number(argumentsValue.factor || 1);
		const pivot = Number(argumentsValue.pivot || 0);
		selectBodySections(creature, argumentsValue).forEach((section) => {
			section.position[0] = pivot + (section.position[0] - pivot) * factor;
		});
	} else if (operation === "creature.body.resample") {
		resampleBody(creature, argumentsValue.sectionCount);
	} else if (operation !== "creature.body.validate") {
		throw new CreatureOperationError("CREATURE_BODY_OPERATION_UNKNOWN", `Unsupported body operation: ${operation}`);
	}
	return { body: creature.body, stableReferenceBehavior: "semantic-section-ids-preserved-where-surviving" };
}
