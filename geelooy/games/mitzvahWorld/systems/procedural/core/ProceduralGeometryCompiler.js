// B"H
import { recipeFor } from "./ProceduralRecipeRegistry.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { adaptTransform } from "./ProceduralTransformAdapter.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { adaptModifiers } from "./ProceduralModifierAdapter.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function compileProceduralGeometry(config = {}) { const recipe = recipeFor(config.recipe || config.primitive); return { id:config.id, primitive:recipe.primitive, recipe, transform:adaptTransform(config), modifiers:adaptModifiers(config.modifiers || []), geometryOptions:config.geometryOptions || {}, source:config.source || config }; }
