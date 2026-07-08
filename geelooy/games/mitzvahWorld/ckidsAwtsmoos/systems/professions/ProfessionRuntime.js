// B"H
/** Professions: trained recipes, legacy crafting hooks, and UI-compatible XP. */
import { craft } from "./RecipeRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { recipeKnown } from "./ProfessionTrainingRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export const RECIPES = Object.freeze({
  challah:{ uses:{ flour:1 }, produces:{ bread:2 }, kind:"crafted" },
  soup:{ uses:{ charity:1 }, produces:{ soup:1 }, kind:"helped" },
  tea:{ uses:{ water:1, honey:1 }, produces:{ tea:2 }, kind:"served" },
  candle:{ uses:{ wax:1 }, produces:{ candle:2 }, kind:"crafted" },
  repaired_bench:{ uses:{ plank:1 }, produces:{ benchRepair:1 }, kind:"crafted" },
  letter:{ uses:{ paper:1, ink:1 }, produces:{ letter:1 }, kind:"returned_lost_object" }
});

function event(type, detail) {
  globalThis.dispatchEvent?.(new CustomEvent(type, { detail }));
  return detail;
}

function ownerOf(target = {}) {
  return target.player || target.chossid || target;
}

export function craftItem(store = globalThis.__MITZVAH_WORLD_STATE__ || {}, recipeId = "challah", crafter = "player", options = {}) {
  const recipe = RECIPES[recipeId];
  if (!recipe) return null;
  if (options.requireTraining && !recipeKnown(store, recipeId)) return { ok:false, error:"recipe_not_trained", recipeId };
  store.economy ||= {};
  for (const [key, amount] of Object.entries(recipe.uses)) if ((store.economy[key] || 0) < amount) return null;
  for (const [key, amount] of Object.entries(recipe.uses)) store.economy[key] -= amount;
  for (const [key, amount] of Object.entries(recipe.produces)) {
    if (key === "benchRepair") {
      store.villageProjects ||= {};
      store.villageProjects.benchRepair = (store.villageProjects.benchRepair || 0) + amount;
    } else {
      store.economy[key] = (store.economy[key] || 0) + amount;
    }
  }
  const item = { id:`${recipeId}_${Date.now()}`, recipeId, crafter, kind:recipe.kind, at:Date.now() };
  store.craftedItems = [...(store.craftedItems || []), item].slice(-40);
  event("mitzvah-world:profession-craft", { item, recipeId, crafter });
  event("mitzvah-world:starter-signal", { signal:"profession", evidence:{ item, recipeId, crafter } });
  return item;
}

export function professionOutputs(store = null) {
  return store ? Object.keys(RECIPES).filter(id => recipeKnown(store, id)) : Object.keys(RECIPES);
}

export function grantProfessionXp(target = globalThis.__MITZVAH_WORLD_STATE__ || {}, profession = "helper", amount = 1, reason = "compat") {
  const owner = ownerOf(target);
  const gain = Number(amount) || 0;
  owner.professions ||= {};
  const row = owner.professions[profession] ||= { xp:0, level:1 };
  row.xp += gain;
  row.level = Math.max(1, Math.floor(row.xp / 100) + 1);
  target.professionXp ||= {};
  target.professionXp[profession] = (target.professionXp[profession] || 0) + gain;
  const payload = { profession, amount:gain, xp:row.xp, level:row.level, total:target.professionXp[profession], reason, at:Date.now() };
  target.ayshPeula?.("ui event", "professionXp", payload);
  event("mitzvah-world:profession-xp", payload);
  return payload;
}

export function createProfessionRuntime(store = {}) {
  const skill = store.professions ||= {};
  return {
    craft(recipeId, bagOrCrafter, options) {
      if (RECIPES[recipeId]) return craftItem(store, recipeId, typeof bagOrCrafter === "string" ? bagOrCrafter : "player", options || {});
      const out = craft(recipeId, bagOrCrafter);
      if (out?.ok) skill[recipeId] = (skill[recipeId] || 0) + 1;
      event("mitzvah-world:crafted", { recipe:recipeId, out, skill });
      return out;
    },
    outputs:() => professionOutputs(store),
    allOutputs:() => Object.keys(RECIPES),
    grantXp:(profession, amount, reason) => grantProfessionXp(store, profession, amount, reason),
    skill:() => ({ ...skill }),
    recipes:RECIPES
  };
}

export default createProfessionRuntime;
