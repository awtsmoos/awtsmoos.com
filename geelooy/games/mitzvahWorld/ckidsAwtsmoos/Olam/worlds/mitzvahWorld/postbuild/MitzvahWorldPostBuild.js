// B"H
/** @file MitzvahWorldPostBuild.js @description Chapter 964: postbuild now installs the full living-region stack report. */
import { EMERALD_NPC_ROLES as NPC_ROLES } from "../data/manifests/NpcInteractionSchema.js";
import { EMERALD_WOOD_NODES as WOOD_COLLECTIBLES } from "../data/collectibles/WoodCollectibles.js";
import { ensureNpcRoles } from "./NpcRolePostBuild.js";
import { ensureWoodCollectibles } from "./WoodCollectiblePostBuild.js";
import { ensureGeneratedBattleLayer } from "./GeneratedBattleLayer.js?v=android-smooth-battle-20260612-bh1";
import { ensureVillageVisualRealityLayer } from "./VillageVisualRealityLayer.js?v=realistic-village-layer-20260612-bh2";
import { ensureVillageBotanicalRealityLayer } from "./VillageBotanicalRealityLayer.js?v=botanical-yellow-road-20260612-bh1";
import { ensureVillageEcologyRealityLayer } from "./VillageEcologyRealityLayer.js?v=complete-v3-ecology-layer-20260612-bh3";
import { ensureMitzvahRegionDirector } from "../region/MitzvahRegionDirector.js?v=full-region-stack-20260612-bh1";
import { warmVillageShaderTextures, getVillageShaderTextureStats } from "../../../../dvarim/nature/villagePicture/RealisticVillageMaterials.js?v=webgl-progress-materials-20260612-bh1";
import { warmEcologySpecialMaterials, ecologyMaterialStats } from "../../../../dvarim/nature/villagePicture/EcologySpecialMaterials.js?v=complete-v3-ecology-materials-20260612-bh3";
async function safeStep(name, task) { try { return { ok: true, value: await task() }; } catch (error) { console.warn("B\"H | MITZVAH_POSTBUILD_STEP_FAILED", { name, message: error?.message || String(error) }); return { ok: false, error: error?.message || String(error) }; } }
function progress(context, label) { return payload => { try { const o = context.olam || context; o?.ayshPeula?.("updateProgress", { shaderTextureProgress: { ...payload, label } }); o?.ayshPeula?.("increase loading percentage", { amount: payload.percent, reset: true, action: `${label}: ${payload.kind}`, subAction: `${payload.percent}% (${payload.done}/${payload.total}) ${payload.channel} via ${payload.backend}` }); } catch {} }; }
export async function runMitzvahWorldPostBuild(context = {}) {
  const olam = context.olam || context;
  const shaderWarm = await safeStep("shaderTextureWarm", () => warmVillageShaderTextures({ size: 256, olam, onProgress: progress(context, "Generating shader texture") }));
  const ecologyWarm = await safeStep("ecologyMaterialWarm", () => warmEcologySpecialMaterials({ size: 256, olam, onProgress: progress(context, "Synthesizing ecology material") }));
  const regionStack = await safeStep("regionStack", () => ensureMitzvahRegionDirector(context));
  const woodCollectibles = await safeStep("woodCollectibles", () => ensureWoodCollectibles(context));
  const roleMarkedNpcs = await safeStep("roleMarkedNpcs", () => ensureNpcRoles(context));
  const battleLayer = await safeStep("battleLayer", () => ensureGeneratedBattleLayer(context));
  const visualReality = await safeStep("visualReality", () => ensureVillageVisualRealityLayer(context));
  const botanicalReality = await safeStep("botanicalReality", () => ensureVillageBotanicalRealityLayer(context));
  const ecologyReality = await safeStep("ecologyReality", () => ensureVillageEcologyRealityLayer(context));
  const addedWood = Array.isArray(woodCollectibles.value) ? woodCollectibles.value.length : 0;
  const markedNpcs = Array.isArray(roleMarkedNpcs.value) ? roleMarkedNpcs.value.length : 0;
  const battleObjects = Array.isArray(battleLayer.value) ? battleLayer.value.length : 0;
  const shaderStats = getVillageShaderTextureStats(); const ecologyStats = ecologyMaterialStats();
  return { skipped: false, reason: "postbuild-full-living-region-stack", source: context?.worldData?.shaym || context?.source || null, steps: { shaderTextureWarm: { ok: shaderWarm.ok, stats: shaderWarm.value || shaderStats, error: shaderWarm.error || null }, ecologyMaterialWarm: { ok: ecologyWarm.ok, stats: ecologyWarm.value || ecologyStats, error: ecologyWarm.error || null }, regionStack: { ok: regionStack.ok, summary: regionStack.value?.summary || null, error: regionStack.error || null }, woodCollectibles: { ok: woodCollectibles.ok, authored: WOOD_COLLECTIBLES.length, added: addedWood, error: woodCollectibles.error || null }, roleMarkedNpcs: { ok: roleMarkedNpcs.ok, authored: Object.keys(NPC_ROLES).length, marked: markedNpcs, error: roleMarkedNpcs.error || null }, battleLayer: { ok: battleLayer.ok, authored: 10, added: battleObjects, error: battleLayer.error || null }, visualReality: { ok: visualReality.ok, added: visualReality.value ? 1 : 0, error: visualReality.error || null }, botanicalReality: { ok: botanicalReality.ok, added: botanicalReality.value ? 1 : 0, stats: botanicalReality.value?.userData?.stats || null, error: botanicalReality.error || null }, ecologyReality: { ok: ecologyReality.ok, added: ecologyReality.value ? 1 : 0, counts: ecologyReality.value?.userData?.counts || null, error: ecologyReality.error || null } }, finalCounts: { woodCollectibles: addedWood, roleMarkedNpcs: markedNpcs, battleLayer: battleObjects, regionStack: regionStack.value ? 1 : 0, visualReality: visualReality.value ? 1 : 0, botanicalReality: botanicalReality.value ? 1 : 0, ecologyReality: ecologyReality.value ? 1 : 0, ramShaderTextures: shaderStats.textures, ecologyTextures: ecologyStats.textures } };
}
