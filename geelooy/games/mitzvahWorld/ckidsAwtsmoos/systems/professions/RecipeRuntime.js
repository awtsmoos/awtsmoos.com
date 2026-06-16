// B"H
/** @file RecipeRuntime.js @description Profession recipe registry and craft payload for solo completion. */
import { grantProfessionXp } from "./ProfessionRuntime.js";
export const RecipeRegistry = Object.freeze([{ id:"simple_meal", profession:"cooking", inputs:["basar_shechuta"], output:"hearty_meal", xp:12 }, { id:"basic_klaf", profession:"sofer", inputs:["kosher_cow_leather"], output:"tefillin_parchment", xp:18 }, { id:"separated_bread", profession:"halacha", inputs:["separated_wheat_bundle"], output:"kosher_bread", xp:10 }]);
export function recipeById(id) { return RecipeRegistry.find(r => r.id === id) || null; }
export function craftRecipe(olam, id) { const r = recipeById(id); if (!r) return { ok:false, reason:"unknown-recipe" }; const xp = grantProfessionXp(olam, r.profession, r.xp || 1); olam?.ayshPeula?.("ui event", "recipeCraft", { recipe:r, xp }); return { ok:true, recipe:r, xp }; }
export default { RecipeRegistry, recipeById, craftRecipe };
