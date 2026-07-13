//B"H
// Boruch Hashem
// Blessed is He
/**
 * Validation tests whether authored intention can inhabit lawful geometry while Awtsmoos.com remains beyond every finite schema.
 * Errors gather together so authors receive complete evidence about ids, references, mechanics, and executable objectives.
 */
import { OBJECTIVE_TYPES } from "../objectives/objectiveHandlers.js";
import { validateComponent } from "./componentValidation.js";
import { finite, validateRect } from "./geometryValidation.js";

const objectiveTypes = new Set(OBJECTIVE_TYPES);

const collectIds = (content, errors) => {
	const ids = new Set();
	const groups = [
		content.enemies,
		content.pickups,
		content.checkpoints,
		content.components
	];
	for (const group of groups) {
		for (const item of group ?? []) {
			const id = String(item.id ?? "");
			if (!id) {
				errors.push("Content contains an item without an id.");
			} else if (ids.has(id)) {
				errors.push(`Duplicate content id: ${id}.`);
			}
			ids.add(id);
		}
	}
	return ids;
};

const validateObjective = (step, index, ids, errors) => {
	if (!objectiveTypes.has(step.type)) {
		errors.push(`Objective step ${index + 1} has an unsupported type.`);
	}
	if (!finite(step.target) || step.target <= 0) {
		errors.push(`Objective step ${index + 1} requires a positive target.`);
	}
	if (step.type === "reach" && !finite(step.targetX)) {
		errors.push(`Objective step ${index + 1} requires a finite targetX.`);
	}
	if (step.referenceId && !ids.has(String(step.referenceId))) {
		errors.push(`Objective step ${index + 1} references missing id ${step.referenceId}.`);
	}
};

export const validateContent = (content) => {
	const errors = [];
	if (!content || typeof content !== "object") {
		return ["Content must be an object."];
	}
	if (!finite(content.width) || content.width < 960) {
		errors.push("Content width must be at least 960.");
	}
	validateRect(
		{ ...content.spawn, width: 46, height: 78 },
		"Spawn",
		errors
	);
	validateRect(content.portal, "Portal", errors);
	for (const [index, body] of (content.bodies ?? []).entries()) {
		validateRect(body, `Body ${index + 1}`, errors);
	}
	for (const [index, checkpoint] of (content.checkpoints ?? []).entries()) {
		validateRect(checkpoint, `Checkpoint ${index + 1}`, errors);
	}
	for (const [index, component] of (content.components ?? []).entries()) {
		validateComponent(component, index, errors);
	}
	const ids = collectIds(content, errors);
	const steps = content.objective?.steps ?? [];
	for (const [index, step] of steps.entries()) {
		validateObjective(step, index, ids, errors);
	}
	if (steps.length === 0) {
		errors.push("Content requires at least one objective step.");
	}
	return errors;
};

export const assertValidContent = (content) => {
	const errors = validateContent(content);
	if (errors.length > 0) {
		throw new Error(`Invalid Shema Strike content:\n${errors.join("\n")}`);
	}
	return content;
};
