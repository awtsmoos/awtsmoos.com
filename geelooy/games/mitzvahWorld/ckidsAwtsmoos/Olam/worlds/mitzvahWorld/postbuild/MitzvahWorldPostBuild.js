// B"H
/**
 * @file MitzvahWorldPostBuild.js
 * @description
 * Chapter 431: the bridge carries grounded battle objects.
 * The Awtsmoos refreshes the postbuild chain so the newly grounded battle layer
 * and its finite-state animals arrive in the live village together.
 */
import { EMERALD_NPC_ROLES as NPC_ROLES } from "../data/manifests/NpcInteractionSchema.js";
import { EMERALD_WOOD_NODES as WOOD_COLLECTIBLES } from "../data/collectibles/WoodCollectibles.js";
import { ensureNpcRoles } from "./NpcRolePostBuild.js";
import { ensureWoodCollectibles } from "./WoodCollectiblePostBuild.js";
import { ensureGeneratedBattleLayer } from "./GeneratedBattleLayer.js?v=village-grounded-battle-20260612-bh1";

async function safeStep(name, task) {
  try { return { ok: true, value: await task() }; }
  catch (error) { console.warn("B\"H | MITZVAH_POSTBUILD_STEP_FAILED", { name, message: error?.message || String(error) }); return { ok: false, error: error?.message || String(error) }; }
}

/** @param {object} context Optional postbuild context. @returns {Promise<object>} Postbuild diagnostic summary. */
export async function runMitzvahWorldPostBuild(context = {}) {
  const woodCollectibles = await safeStep("woodCollectibles", () => ensureWoodCollectibles(context));
  const roleMarkedNpcs = await safeStep("roleMarkedNpcs", () => ensureNpcRoles(context));
  const battleLayer = await safeStep("battleLayer", () => ensureGeneratedBattleLayer(context));
  const addedWood = Array.isArray(woodCollectibles.value) ? woodCollectibles.value.length : 0;
  const markedNpcs = Array.isArray(roleMarkedNpcs.value) ? roleMarkedNpcs.value.length : 0;
  const battleObjects = Array.isArray(battleLayer.value) ? battleLayer.value.length : 0;
  return {
    skipped: false,
    reason: "focused-safe-postbuild",
    source: context?.worldData?.shaym || context?.source || null,
    steps: {
      woodCollectibles: { ok: woodCollectibles.ok, authored: WOOD_COLLECTIBLES.length, added: addedWood, error: woodCollectibles.error || null },
      roleMarkedNpcs: { ok: roleMarkedNpcs.ok, authored: Object.keys(NPC_ROLES).length, marked: markedNpcs, error: roleMarkedNpcs.error || null },
      battleLayer: { ok: battleLayer.ok, authored: 10, added: battleObjects, error: battleLayer.error || null }
    },
    finalCounts: { woodCollectibles: addedWood, roleMarkedNpcs: markedNpcs, battleLayer: battleObjects }
  };
}
