// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	collectNumericIssues
} from "./numberRules.js";
import {
	validateRecipeCommands
} from "./recipeCommandValidator.js";
import {
	validateCommandSemantics
} from "./recipeCommandSemanticsValidator.js";
import {
	validateRecipeEnvelope
} from "./recipeEnvelopeValidator.js";
import {
	validateRecipeGuides
} from "./recipeGuideValidator.js";
import {
	validateRecipeLandmarks,
	validateRecipeReferences
} from "./recipeReferenceValidator.js";
import {
	validateRecipeAsset,
	validateRecipeMaterials,
	validateRecipeParts,
	validateRecipeRig
} from "./recipeStructureValidator.js";
import {
	AnimalMeshValidationResult
} from "./ValidationResult.js";

export class AnimalMeshRecipeValidator {
	validate(recipe) {
		const result = new AnimalMeshValidationResult();
		if (!recipe || typeof recipe !== "object" || Array.isArray(recipe)) {
			result.addError("/", "recipe_type", "Recipe must be an object.");
			return result;
		}
		validateRecipeEnvelope(recipe, result);
		validateRecipeAsset(recipe.asset, result);
		validateRecipeReferences(recipe.references, result);
		validateRecipeLandmarks(recipe.landmarks, result);
		validateRecipeGuides(recipe.anatomical_guides, result);
		validateRecipeMaterials(recipe.materials, result);
		validateRecipeParts(recipe.parts, result);
		validateRecipeRig(recipe.rig, result);
		validateRecipeCommands(recipe.commands, result);
		validateCommandSemantics(recipe, result);
		for (const issue of collectNumericIssues(recipe)) {
			result.addError(issue.path, "numeric_safety", issue.message);
		}
		return result;
	}

	assertValid(recipe) {
		const result = this.validate(recipe);
		if (!result.valid) {
			const message = result.errors
				.map((issue) => `${issue.path}: ${issue.message}`)
				.join("\n");
			throw new Error(`B"H | Invalid animal mesh recipe\n${message}`);
		}
		return recipe;
	}
}

export const animalMeshRecipeValidator = new AnimalMeshRecipeValidator();
