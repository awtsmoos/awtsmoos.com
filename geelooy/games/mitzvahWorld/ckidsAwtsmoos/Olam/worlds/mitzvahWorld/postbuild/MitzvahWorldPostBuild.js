// B"H
/** @file MitzvahWorldPostBuild.js @description Player-first postbuild; no sync scenery jail. */
import { EMERALD_NPC_ROLES as NPC_ROLES } from "../data/manifests/NpcInteractionSchema.js";
import { EMERALD_WOOD_NODES as WOOD_COLLECTIBLES } from "../data/collectibles/WoodCollectibles.js";
import { ensureNpcRoles } from "./NpcRolePostBuild.js";
import { ensureWoodCollectibles } from "./WoodCollectiblePostBuild.js";
import { ensureMitzvahRegionDirector } from "../region/MitzvahRegionDirector.js?v=ecology-data-spine-20260612-bh1";
import { ensureLivingRegionRuntime } from "../region/render/LivingRegionRuntime.js?v=no-alert-perf-jump-20260701-bh9";
import { postWorkerProgress } from "../../../oyved/core/protocol/WorkerProtocol.js?v=no-alert-perf-jump-20260701-bh9";
const HEAVY_DEFERRED = ["battleLayer", "visualReality", "botanicalReality", "ecologyReality", "worldPolish", "hyperRealSunLensFlare", "livingTorahQuestLoop", "movieUniverseJson", "emeraldInfinity", "wildlifeCarcassLoot", "cinematicDirector", "shaderTextureWarm", "ecologyMaterialWarm", "npc3DMarkers", "proceduralWorldJson"];
const sourceOf = context => context?.worldData?.shaym || context?.source || null;
const mark = (stage, data = {}) => postWorkerProgress(`postbuild:${stage}`, data);
const one = r => r?.value ? 1 : 0;
const err = error => error?.message || String(error);
const summary = r => r.value?.summary || null;
const stats = r => r.value?.userData?.stats || null;
const stepLine = (r, extra = {}) => ({ ok:r.ok, skipped:Boolean(r.skipped), error:r.error || null, elapsedMs:r.elapsedMs || null, ...extra });
async function safeStep(name, task) { const t = performance.now(); mark(`${name}:start`); try { const value = await task(); const elapsedMs = Math.round(performance.now() - t); mark(`${name}:done`, { elapsedMs }); return { ok:true, value, elapsedMs }; } catch (e) { const message = err(e); mark(`${name}:error`, { message }); console.warn('B"H | MITZVAH_POSTBUILD_STEP_FAILED', { name, message }); return { ok:false, error:message, value:null, elapsedMs:Math.round(performance.now() - t) }; } }
function skipped(name, reason = "deferred-after-first-render") { const r = { ok:true, skipped:true, value:null, error:null, elapsedMs:0, reason }; mark(`${name}:deferred`, { reason }); return r; }
function finalizeReady(context, report) { const olam = context.olam || context; if (olam) { olam.__worldPostbuildReady = { ok:true, playerFirst:true, report, deferredHeavyLayers:HEAVY_DEFERRED, at:Date.now() }; olam.__mitzvahWorldPostBuildDone = true; } mark("ready-for-first-render", { playerFirst:true, deferredHeavyLayers:HEAVY_DEFERRED }); }
export async function runMitzvahWorldPostBuild(context = {}) {
  const start = performance.now(); mark("start", { source:sourceOf(context), playerFirst:true, deferredHeavyLayers:HEAVY_DEFERRED });
  const regionStack = await safeStep("regionStack", () => ensureMitzvahRegionDirector(context));
  const livingRuntime = await safeStep("livingRegionRuntime", () => ensureLivingRegionRuntime(context, regionStack.value || {}));
  const woodCollectibles = await safeStep("woodCollectibles", () => ensureWoodCollectibles(context));
  const roleMarkedNpcs = await safeStep("roleMarkedNpcs", () => ensureNpcRoles(context));
  const npc3DMarkers = skipped("npc3DMarkers");
  const proceduralWorld = skipped("proceduralWorldJson");
  const battleLayer = skipped("battleLayer");
  const carcassLoot = skipped("wildlifeCarcassLoot");
  const cinematicDirector = skipped("cinematicDirector");
  const shaderWarm = skipped("shaderTextureWarm");
  const ecologyWarm = skipped("ecologyMaterialWarm");
  const visualReality = skipped("visualReality");
  const botanicalReality = skipped("botanicalReality");
  const ecologyReality = skipped("ecologyReality");
  const worldPolish = skipped("worldPolish");
  const hyperSun = skipped("hyperRealSunLensFlare");
  const torahLoop = skipped("livingTorahQuestLoop");
  const movieUniverse = skipped("movieUniverseJson");
  const emeraldInfinity = skipped("emeraldInfinity");
  const report = { skipped:false, playerFirst:true, reason:"postbuild-player-first-no-sync-scenery-jail-bh9", source:sourceOf(context), elapsedMs:Math.round(performance.now() - start), deferredHeavyLayers:HEAVY_DEFERRED, steps:{ regionStack:stepLine(regionStack, { summary:summary(regionStack) }), livingRegionRuntime:stepLine(livingRuntime, { stats:stats(livingRuntime) }), woodCollectibles:stepLine(woodCollectibles, { authored:WOOD_COLLECTIBLES.length }), roleMarkedNpcs:stepLine(roleMarkedNpcs, { authored:Object.keys(NPC_ROLES).length }), npc3DMarkers:stepLine(npc3DMarkers), proceduralWorldJson:stepLine(proceduralWorld), battleLayer:stepLine(battleLayer), wildlifeCarcassLoot:stepLine(carcassLoot), cinematicDirector:stepLine(cinematicDirector), shaderTextureWarm:stepLine(shaderWarm), ecologyMaterialWarm:stepLine(ecologyWarm), visualReality:stepLine(visualReality), botanicalReality:stepLine(botanicalReality), ecologyReality:stepLine(ecologyReality), worldPolish:stepLine(worldPolish), hyperRealSunLensFlare:stepLine(hyperSun), livingTorahQuestLoop:stepLine(torahLoop), movieUniverseJson:stepLine(movieUniverse), emeraldInfinity:stepLine(emeraldInfinity) } };
  finalizeReady(context, report); mark("done", { elapsedMs:report.elapsedMs, playerFirst:true, deferredHeavyLayers:HEAVY_DEFERRED, livingRegionRuntimeMs:livingRuntime.elapsedMs || 0, regionStackMs:regionStack.elapsedMs || 0 }); return report;
}
