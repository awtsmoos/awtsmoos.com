// B"H
/**
 * @file MitzvahWorldPostBuild.js
 * @description Chapter 1004: proof completes before optional ornament can stall creation.
 */
import { EMERALD_NPC_ROLES as NPC_ROLES } from "../data/manifests/NpcInteractionSchema.js";
import { EMERALD_WOOD_NODES as WOOD_COLLECTIBLES } from "../data/collectibles/WoodCollectibles.js";
import { ensureNpcRoles } from "./NpcRolePostBuild.js";
import { ensureWoodCollectibles } from "./WoodCollectiblePostBuild.js";
import { ensureGeneratedBattleLayer } from "./GeneratedBattleLayer.js?v=android-smooth-battle-20260612-bh1";
import { ensureVillageVisualRealityLayer } from "./VillageVisualRealityLayer.js?v=realistic-village-layer-20260612-bh2";
import { ensureVillageBotanicalRealityLayer } from "./VillageBotanicalRealityLayer.js?v=botanical-yellow-road-20260612-bh1";
import { ensureVillageEcologyRealityLayer } from "./VillageEcologyRealityLayer.js?v=complete-v3-ecology-layer-20260612-bh3";
import { ensureMitzvahRegionDirector } from "../region/MitzvahRegionDirector.js?v=ecology-data-spine-20260612-bh1";
import { ensureLivingRegionRuntime } from "../region/render/LivingRegionRuntime.js?v=ecology-runtime-20260612-bh2";
import { getVillageShaderTextureStats } from "../../../../dvarim/nature/villagePicture/RealisticVillageMaterials.js?v=webgl-progress-materials-20260612-bh1";
import { ecologyMaterialStats } from "../../../../dvarim/nature/villagePicture/EcologySpecialMaterials.js?v=complete-v3-ecology-materials-20260612-bh3";
import { postWorkerProgress } from "../../../oyved/core/protocol/WorkerProtocol.js";

function mark(stage, data = {}) { postWorkerProgress(`postbuild:${stage}`, data); }
async function safeStep(name, task) {
  const startedAt = performance.now(); mark(`${name}:start`);
  try { const value = await task(); mark(`${name}:done`, { elapsedMs: Math.round(performance.now() - startedAt) }); return { ok: true, value }; }
  catch (error) { mark(`${name}:error`, { message: error?.message || String(error) }); console.warn("B\"H | MITZVAH_POSTBUILD_STEP_FAILED", { name, message: error?.message || String(error) }); return { ok: false, error: error?.message || String(error) }; }
}
function countArray(result) { return Array.isArray(result.value) ? result.value.length : 0; }
function one(result) { return result.value ? 1 : 0; }
function skippedWarm(kind, stats) { return { skipped: true, kind, reason: "runtime-proof-first-fast-materials", stats }; }

export async function runMitzvahWorldPostBuild(context = {}) {
  mark("start", { source: context?.worldData?.shaym || context?.source || null, proofFirst: true });
  const regionStack = await safeStep("regionStack", () => ensureMitzvahRegionDirector(context));
  const livingRuntime = await safeStep("livingRegionRuntime", () => ensureLivingRegionRuntime(context, regionStack.value || {}));
  const woodCollectibles = await safeStep("woodCollectibles", () => ensureWoodCollectibles(context));
  const roleMarkedNpcs = await safeStep("roleMarkedNpcs", () => ensureNpcRoles(context));
  const battleLayer = await safeStep("battleLayer", () => ensureGeneratedBattleLayer(context));
  const shaderWarm = await safeStep("shaderTextureWarm", () => skippedWarm("villageShaderTextures", getVillageShaderTextureStats()));
  const ecologyWarm = await safeStep("ecologyMaterialWarm", () => skippedWarm("ecologyMaterials", ecologyMaterialStats()));
  const visualReality = await safeStep("visualReality", () => ensureVillageVisualRealityLayer(context));
  const botanicalReality = await safeStep("botanicalReality", () => ensureVillageBotanicalRealityLayer(context));
  const ecologyReality = await safeStep("ecologyReality", () => ensureVillageEcologyRealityLayer(context));
  mark("done", { regionStack: one(regionStack), livingRuntime: one(livingRuntime), visibleInstances: regionStack.value?.summary?.visibleInstances || 0, npcSchedules: regionStack.value?.summary?.npcSchedules || 0 });
  return {
    skipped: false, reason: "postbuild-proof-first-full-region-runtime", source: context?.worldData?.shaym || context?.source || null,
    steps: {
      regionStack: { ok: regionStack.ok, summary: regionStack.value?.summary || null, error: regionStack.error || null },
      livingRegionRuntime: { ok: livingRuntime.ok, stats: livingRuntime.value?.userData?.stats || null, error: livingRuntime.error || null },
      woodCollectibles: { ok: woodCollectibles.ok, authored: WOOD_COLLECTIBLES.length, added: countArray(woodCollectibles), error: woodCollectibles.error || null },
      roleMarkedNpcs: { ok: roleMarkedNpcs.ok, authored: Object.keys(NPC_ROLES).length, marked: countArray(roleMarkedNpcs), error: roleMarkedNpcs.error || null },
      battleLayer: { ok: battleLayer.ok, added: countArray(battleLayer), error: battleLayer.error || null },
      shaderTextureWarm: { ok: shaderWarm.ok, ...(shaderWarm.value || {}), error: shaderWarm.error || null },
      ecologyMaterialWarm: { ok: ecologyWarm.ok, ...(ecologyWarm.value || {}), error: ecologyWarm.error || null },
      visualReality: { ok: visualReality.ok, added: one(visualReality), error: visualReality.error || null },
      botanicalReality: { ok: botanicalReality.ok, added: one(botanicalReality), error: botanicalReality.error || null },
      ecologyReality: { ok: ecologyReality.ok, added: one(ecologyReality), counts: ecologyReality.value?.userData?.counts || null, error: ecologyReality.error || null }
    }
  };
}
