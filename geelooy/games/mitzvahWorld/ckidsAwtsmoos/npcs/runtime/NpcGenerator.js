// B"H
/** @file NpcGenerator.js @description One generated NPC entity carries appearance, voice, schedule, home, dialogue, quests, trade, and combat AI. */
import { npcAppearance } from "./NpcAppearanceModel.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { npcSchedule } from "./NpcScheduleModel.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { npcDialogue } from "./NpcDialogueModel.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { npcInventory } from "./NpcInventoryModel.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function generateNpc(spec = {}) {
  const role = spec.role || spec.occupation || "villager", seed = Number(spec.seed || role.length);
  return { id:spec.id || `npc_${String(spec.name || role).replace(/\s+/g,"_")}`, kind:"npc", name:spec.name || role, tags:["npc", role], appearance:npcAppearance(seed, spec.appearance), voice:spec.voice || "warm", occupation:role, schedule:spec.schedule || npcSchedule(role), home:spec.home || `${role}-home`, friends:spec.friends || [], enemies:spec.enemies || [], dialogue:npcDialogue(role, spec.mood), quests:spec.quests || [], inventory:npcInventory(role), combatAI:{ courage:seed % 10 / 10, avoidsInnocents:true, style:spec.combatStyle || "defensive" }, animations:["idle","walk","talk","pray","work"] };
}
export function installGeneratedNpcs(runtime, specs = []) { const npcs = specs.map(generateNpc); for (const npc of npcs) runtime?.registerEntity?.(npc); runtime?.markReady?.("npcs:generated", { count:npcs.length }); return npcs; }
export default generateNpc;
