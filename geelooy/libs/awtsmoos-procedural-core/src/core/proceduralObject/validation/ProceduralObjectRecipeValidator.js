// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */
import {
	isProceduralOperationName,
	PROCEDURAL_OBJECT_LIMITS,
	PROCEDURAL_OBJECT_SCHEMA,
	PROCEDURAL_OBJECT_SCHEMA_VERSION
} from "../constants/proceduralObjectContract.js";
import {
	analyzeDependencies
} from "./dependencyGraph.js";
import {
	validateFiniteNumbers
} from "./numberRules.js";
import {
	validateSafeRecipeValue
} from "./securityRules.js";
import {
	ValidationResult
} from "./ValidationResult.js";

function validateEnvelope(recipe, result) {
	if (recipe?.schema !== PROCEDURAL_OBJECT_SCHEMA) {
		result.addError("/schema", "Unknown procedural object schema.");
	}
	if (recipe?.schema_version !== PROCEDURAL_OBJECT_SCHEMA_VERSION) {
		result.addError("/schema_version", "Unsupported schema version.");
	}
	if (!recipe?.recipe_id || typeof recipe.recipe_id !== "string") {
		result.addError("/recipe_id", "A stable recipe id is required.");
	}
	if (recipe?.mode !== "full_recipe") {
		result.addError("/mode", "Full recipes require mode full_recipe.");
	}
	for (const key of [
		"commands",
		"materials",
		"data_blocks",
		"links",
		"objects",
		"outputs"
	]) {
		if (!Array.isArray(recipe?.[key])) {
			result.addError(`/${key}`, `${key} must be an array.`);
		}
	}
}

function validateCommands(commands, result) {
	if (!Array.isArray(commands)) {
		return;
	}
	if (commands.length > PROCEDURAL_OBJECT_LIMITS.maximumCommands) {
		result.addError("/commands", "Command count exceeds the safety limit.");
	}
	const ids = new Set();
	commands.forEach((command, index) => {
		const path = `/commands/${index}`;
		if (!command?.id || ids.has(command.id)) {
			result.addError(`${path}/id`, "Command ids must be unique and non-empty.");
		}
		ids.add(command?.id);
		if (!isProceduralOperationName(command?.op)) {
			result.addError(`${path}/op`, "Operation is not whitelisted.");
		}
		if (!command?.target || typeof command.target !== "string") {
			result.addError(`${path}/target`, "Commands require stable targets.");
		}
		if (!Array.isArray(command?.depends_on)) {
			result.addError(`${path}/depends_on`, "depends_on must be an array.");
		}
	});
	const graph = analyzeDependencies(commands);
	for (const missing of graph.missing) {
		result.addError("/commands", `Missing dependency ${missing.dependency}.`);
	}
	if (graph.cycles.length) {
		result.addError("/commands", "Circular command dependencies are forbidden.");
	}
}

function validateCollectionLimits(recipe, result) {
	const checks = [
		["objects", "maximumObjects"],
		["data_blocks", "maximumDataBlocks"],
		["links", "maximumLinks"]
	];
	for (const [key, limitKey] of checks) {
		if ((recipe?.[key]?.length || 0) > PROCEDURAL_OBJECT_LIMITS[limitKey]) {
			result.addError(`/${key}`, `${key} exceeds the safety limit.`);
		}
	}
}

/**
 * Validates safe generic procedural recipes without repairing them silently.
 */
export class ProceduralObjectRecipeValidator {
	validate(recipe) {
		const result = new ValidationResult();
		validateEnvelope(recipe, result);
		validateCommands(recipe?.commands, result);
		validateCollectionLimits(recipe, result);
		validateFiniteNumbers(recipe, "", result);
		validateSafeRecipeValue(recipe, "", result);
		return result;
	}

	assertValid(recipe) {
		return this.validate(recipe).assertValid();
	}
}

export const proceduralObjectRecipeValidator = new ProceduralObjectRecipeValidator();
