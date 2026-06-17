// B"H
import { recipeFor } from "./ProceduralRecipeRegistry.js";
import { adaptTransform } from "./ProceduralTransformAdapter.js";
import { adaptModifiers } from "./ProceduralModifierAdapter.js";
export function compileProceduralGeometry(config = {}) { const recipe = recipeFor(config.recipe || config.primitive); return { id:config.id, primitive:recipe.primitive, recipe, transform:adaptTransform(config), modifiers:adaptModifiers(config.modifiers || []), geometryOptions:config.geometryOptions || {}, source:config.source || config }; }
