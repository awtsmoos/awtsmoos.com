// B"H
/** Professions create social objects; beverage realism is an existing recipe/key extension, not a new system. */
import { recipeKnown } from './ProfessionTrainingRuntime.js';
export const RECIPES = Object.freeze({ challah:{uses:{flour:1},produces:{bread:2},kind:'crafted'}, soup:{uses:{charity:1},produces:{soup:1},kind:'helped'}, tea:{uses:{water:1,honey:1},produces:{tea:2},kind:'served'}, candle:{uses:{wax:1},produces:{candle:2},kind:'crafted'}, repaired_bench:{uses:{plank:1},produces:{benchRepair:1},kind:'crafted'}, letter:{uses:{paper:1,ink:1},produces:{letter:1},kind:'returned_lost_object'} });
function event(type, detail) { globalThis.dispatchEvent?.(new CustomEvent(type, { detail })); return detail; }
export function craftItem(store = globalThis.__MITZVAH_WORLD_STATE__ || {}, recipeId = 'challah', crafter = 'player', options = {}) {
  const recipe = RECIPES[recipeId];
  if (!recipe) return null;
  if (options.requireTraining && !recipeKnown(store, recipeId)) return { ok:false, error:'recipe_not_trained', recipeId };
  store.economy ||= {};
  for (const [k,v] of Object.entries(recipe.uses)) if ((store.economy[k] || 0) < v) return null;
  for (const [k,v] of Object.entries(recipe.uses)) store.economy[k] -= v;
  for (const [k,v] of Object.entries(recipe.produces)) { if (k === 'benchRepair') { store.villageProjects ||= {}; store.villageProjects.benchRepair = (store.villageProjects.benchRepair || 0) + v; } else store.economy[k] = (store.economy[k] || 0) + v; }
  const item = { id:`${recipeId}_${Date.now()}`, recipeId, crafter, kind:recipe.kind, at:Date.now() };
  store.craftedItems = [...(store.craftedItems || []), item].slice(-40);
  event('mitzvah-world:profession-craft', { item, recipeId, crafter });
  event('mitzvah-world:starter-signal', { signal:'profession', evidence:{ item, recipeId, crafter } });
  return item;
}
export function professionOutputs(store = null) { return store ? Object.keys(RECIPES).filter(id => recipeKnown(store, id)) : Object.keys(RECIPES); }
export function grantProfessionXp(store = globalThis.__MITZVAH_WORLD_STATE__ || {}, profession = 'helper', amount = 1, reason = 'compat') { store.professionXp ||= {}; store.professionXp[profession] = (store.professionXp[profession] || 0) + amount; const payload = { profession, amount, total:store.professionXp[profession], reason, at:Date.now() }; event('mitzvah-world:profession-xp', payload); return payload; }
export function createProfessionRuntime(store) { return { craft:(id,crafter,options) => craftItem(store,id,crafter,options), outputs:() => professionOutputs(store), allOutputs:() => Object.keys(RECIPES), grantXp:(profession, amount, reason) => grantProfessionXp(store, profession, amount, reason), recipes:RECIPES }; }
export default createProfessionRuntime;
