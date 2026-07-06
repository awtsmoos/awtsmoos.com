// B"H
/** @file CompactWorldCompiler.js @description AI JSON becomes runtime-safe intents; animal biology is created by the animal factory. */
import { normalizeWorldIntent } from "./CompactWorldIntentSchema.js";
function slug(value) { return String(value || "thing").replace(/\s+/g, "_"); }
function addEntity(list, kind, name, data = {}) { if (!name) return; list.push({ id:`${kind}_${slug(name)}`, kind, name, tags:[kind,"ai-generated"], data }); }
export function compileCompactWorldIntent(intent = {}) {
  const src = normalizeWorldIntent(intent), entities = [];
  ["village","river","mountain","synagogue","forest","farm","road"].forEach(k => addEntity(entities, k, src[k]?.name || src[k], src[k] || {}));
  for (const npc of src.npcs || []) addEntity(entities, "npcIntent", npc.name || npc.role, npc);
  for (const animal of src.animals || []) addEntity(entities, "animalSpawn", animal.name || animal.species, animal);
  for (const region of src.regions || []) addEntity(entities, "region", region.name || region.type, region);
  return { id:`world_${src.seed}`, name:src.name, seed:src.seed, entities, schedules:src.schedules || [], quests:src.quests || [], dialogue:src.dialogue || [], weather:src.weather || null, economy:src.economy || null, actorSpecs:{ npcs:src.npcs || [], animals:src.animals || [] } };
}
export default compileCompactWorldIntent;
