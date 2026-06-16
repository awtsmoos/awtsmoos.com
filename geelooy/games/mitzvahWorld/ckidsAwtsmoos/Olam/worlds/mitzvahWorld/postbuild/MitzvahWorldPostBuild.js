// B"H
/**
 * @file MitzvahWorldPostBuild.js
 * @description Every changed polish layer receives a fresh import breath and parser-clear handoff.
 */
import { EMERALD_NPC_ROLES as NPC_ROLES } from "../data/manifests/NpcInteractionSchema.js";
import { EMERALD_WOOD_NODES as WOOD_COLLECTIBLES } from "../data/collectibles/WoodCollectibles.js";
import { ensureNpcRoles } from "./NpcRolePostBuild.js";
import { ensureWoodCollectibles } from "./WoodCollectiblePostBuild.js";
import { ensureGeneratedBattleLayer } from "./GeneratedBattleLayer.js?v=awtsmoos-battle-layer-20260614-bh2";
import { ensureVillageVisualRealityLayer } from "./VillageVisualRealityLayer.js?v=awtsmoos-visual-reality-20260614-bh3";
import { ensureVillageBotanicalRealityLayer } from "./VillageBotanicalRealityLayer.js?v=awtsmoos-botanical-reality-20260614-bh3";
import { ensureVillageEcologyRealityLayer } from "./VillageEcologyRealityLayer.js?v=awtsmoos-ecology-reality-20260614-bh3";
import { ensureVillageWorldPolishPass } from "./VillageWorldPolishPass.js?v=awtsmoos-world-polish-20260614-bh2";
import { ensureMitzvahRegionDirector } from "../region/MitzvahRegionDirector.js?v=ecology-data-spine-20260612-bh1";
import { ensureLivingRegionRuntime } from "../region/render/LivingRegionRuntime.js?v=mobile-region-grass-wildlife-20260615-bh903";
import { getVillageShaderTextureStats } from "../../../../dvarim/nature/villagePicture/RealisticVillageMaterials.js?v=awtsmoos-realistic-village-materials-20260614-bh3";
import { ecologyMaterialStats } from "../../../../dvarim/nature/villagePicture/EcologySpecialMaterials.js?v=awtsmoos-ecology-materials-20260614-bh3";
import { postWorkerProgress } from "../../../oyved/core/protocol/WorkerProtocol.js";
function sourceOf(context) { if (context && context.worldData && context.worldData.shaym) return context.worldData.shaym; return context && context.source ? context.source : null; }
function mark(stage, data = {}) { postWorkerProgress(`postbuild:${stage}`, data); }
function errorMessage(error) { return error && error.message ? error.message : String(error); }
async function safeStep(name, task) { const startedAt = performance.now(); mark(`${name}:start`); try { const value = await task(); mark(`${name}:done`, { elapsedMs:Math.round(performance.now() - startedAt) }); return { ok:true, value }; } catch (error) { const message = errorMessage(error); mark(`${name}:error`, { message }); console.warn("B\"H | MITZVAH_POSTBUILD_STEP_FAILED", { name, message }); return { ok:false, error:message }; } }
function countArray(result) { return Array.isArray(result.value) ? result.value.length : 0; }
function one(result) { return result.value ? 1 : 0; }
function skippedWarm(kind, stats) { return { skipped:true, kind, reason:"runtime-proof-first-fast-materials", stats }; }
function regionSummary(result) { return result.value && result.value.summary ? result.value.summary : null; }
function livingStats(result) { return result.value && result.value.userData ? result.value.userData.stats || null : null; }
export async function runMitzvahWorldPostBuild(context = {}) {
  mark("start", { source:sourceOf(context), proofFirst:true });
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
  const worldPolish = await safeStep("worldPolish", () => ensureVillageWorldPolishPass(context));
  const summary = regionSummary(regionStack) || {};
  mark("done", { regionStack:one(regionStack), livingRuntime:one(livingRuntime), worldPolish:one(worldPolish), visibleInstances:summary.visibleInstances || 0, npcSchedules:summary.npcSchedules || 0 });
  return { skipped:false, reason:"postbuild-proof-first-full-region-runtime-polished-cache-fresh", source:sourceOf(context), steps:{ regionStack:{ ok:regionStack.ok, summary:regionSummary(regionStack), error:regionStack.error || null }, livingRegionRuntime:{ ok:livingRuntime.ok, stats:livingStats(livingRuntime), error:livingRuntime.error || null }, woodCollectibles:{ ok:woodCollectibles.ok, authored:WOOD_COLLECTIBLES.length, added:countArray(woodCollectibles), error:woodCollectibles.error || null }, roleMarkedNpcs:{ ok:roleMarkedNpcs.ok, authored:Object.keys(NPC_ROLES).length, marked:countArray(roleMarkedNpcs), error:roleMarkedNpcs.error || null }, battleLayer:{ ok:battleLayer.ok, added:countArray(battleLayer), error:battleLayer.error || null }, shaderTextureWarm:{ ok:shaderWarm.ok, value:shaderWarm.value || null, error:shaderWarm.error || null }, ecologyMaterialWarm:{ ok:ecologyWarm.ok, value:ecologyWarm.value || null, error:ecologyWarm.error || null }, visualReality:{ ok:visualReality.ok, added:one(visualReality), error:visualReality.error || null }, botanicalReality:{ ok:botanicalReality.ok, added:one(botanicalReality), error:botanicalReality.error || null }, ecologyReality:{ ok:ecologyReality.ok, added:one(ecologyReality), counts:livingStats(ecologyReality), error:ecologyReality.error || null }, worldPolish:{ ok:worldPolish.ok, added:one(worldPolish), steps:worldPolish.value ? worldPolish.value.steps || null : null, error:worldPolish.error || null } } };
}
