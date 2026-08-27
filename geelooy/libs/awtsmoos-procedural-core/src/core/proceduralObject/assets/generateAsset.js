// B"H
// Boruch Hashem
// Blessed is He
/** A typed recipe becomes an artifact through explicit generators and modifiers. */

import { createAssetRecipe } from "./createAssetRecipe.js";
import { evaluateModifierStack } from "../modifiers/evaluateModifierStack.js";

export function generateAsset(input, context) {
	const recipe = createAssetRecipe(input);
	const generator = context?.generatorRegistry?.resolve(recipe.generatorId);
	if (!generator) throw new Error(`Unknown asset generator: ${recipe.generatorId}`);
	const generated = generator(Object.freeze({ parameters: recipe.parameters, recipe, context }));
	const result = context.modifierRegistry
		? evaluateModifierStack(generated, recipe.modifierStack, context.modifierRegistry, context)
		: Object.freeze({ artifact: generated, trace: Object.freeze([]), diagnostics: Object.freeze([]) });
	return Object.freeze({ recipe, ...result });
}
