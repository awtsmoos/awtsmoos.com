// B"H
/**
 * @file MitzvahWorldPostBuild.js
 * @description Player-first postbuild for terrain, living region, vehicles, and deferred polish.
 */
import { EMERALD_NPC_ROLES as NPC_ROLES } from "../data/manifests/NpcInteractionSchema.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { EMERALD_WOOD_NODES as WOOD_COLLECTIBLES } from "../data/collectibles/WoodCollectibles.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { ensureNpcRoles } from "./NpcRolePostBuild.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { ensureWoodCollectibles } from "./WoodCollectiblePostBuild.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { ensureGeneratedBattleLayer } from "./GeneratedBattleLayer.js?compact=true&v=perf-tight-collision-20260703-bh2";
import { ensureFinalGroundingPass } from "./FinalGroundingPass.js?compact=true&v=full-chain-cache-bust-20260708-bh10";
import { ensureMitzvahRegionDirector } from "../region/MitzvahRegionDirector.js?compact=true&v=ecology-data-spine-20260612-bh1";
import { ensureLivingRegionRuntime } from "../region/render/LivingRegionRuntime.js?compact=true&v=perf-tight-collision-20260703-bh3";
import { ensureVehiclePostBuildLayer } from "./VehiclePostBuildLayer.js?compact=true&v=vehicles-u-mount-20260706-bh1";
import { postWorkerProgress } from "../../../oyved/core/protocol/WorkerProtocol.js?compact=true&v=case-correct-olam-import-20260706-bh3";

const DEFERRED_VISUAL_STEPS = Object.freeze([
  "woodCollectibles", "roleMarkedNpcs", "battleLayer", "finalGrounding",
  "npc3DMarkers", "proceduralWorldJson", "wildlifeCarcassLoot", "cinematicDirector",
  "shaderTextureWarm", "ecologyMaterialWarm", "visualReality", "botanicalReality",
  "ecologyReality", "worldPolish", "hyperRealSunLensFlare", "livingTorahQuestLoop",
  "movieUniverseJson", "emeraldInfinity"
]);

const sourceOf = context => context?.worldData?.shaym || context?.source || null;
const olamOf = context => context.olam || context;
const err = error => error?.message || String(error);
const mark = (stage, data = {}) => { try { postWorkerProgress(`postbuild:${stage}`, data); } catch {} };

function stepLine(result, extra = {}) {
  return {
    ok: result.ok,
    skipped: Boolean(result.skipped),
    deferred: Boolean(result.deferred),
    error: result.error || null,
    elapsedMs: result.elapsedMs || null,
    ...extra
  };
}

async function safeStep(name, task) {
  const started = performance.now();
  mark(`${name}:start`);
  try {
    const value = await task();
    const elapsedMs = Math.round(performance.now() - started);
    mark(`${name}:done`, { elapsedMs, count: Array.isArray(value) ? value.length : undefined });
    return { ok: true, value, elapsedMs };
  } catch (error) {
    const message = err(error);
    mark(`${name}:error`, { message });
    console.warn('B"H | MITZVAH_POSTBUILD_STEP_FAILED', { name, message });
    return { ok: false, error: message, value: null, elapsedMs: Math.round(performance.now() - started) };
  }
}

function deferred(name, reason = "after-first-playable-frame") {
  mark(`${name}:deferred`, { reason });
  return { ok: true, skipped: true, deferred: true, value: null, error: null, elapsedMs: 0, reason };
}

function idle(task) {
  const run = () => task().catch(error => console.warn('B"H | DEFERRED_POSTBUILD_FAILED', err(error)));
  if (globalThis.requestIdleCallback) requestIdleCallback(run, { timeout: 6000 });
  else setTimeout(run, 1500);
}

function scheduleDeferred(context) {
  const tasks = [
    ["woodCollectibles", () => ensureWoodCollectibles(context)],
    ["roleMarkedNpcs", () => ensureNpcRoles(context)],
    ["battleLayer", () => ensureGeneratedBattleLayer(context)],
    ["finalGrounding", () => ensureFinalGroundingPass(context)]
  ];
  let delay = 1200;
  for (const [name, task] of tasks) {
    setTimeout(() => idle(async () => {
      const result = await safeStep(`${name}:late`, task);
      mark(`${name}:late-summary`, { ok: result.ok, elapsedMs: result.elapsedMs });
    }), delay);
    delay += 900;
  }
}

function finalizeReady(context, report) {
  const olam = olamOf(context);
  if (olam) {
    olam.__worldPostbuildReady = { ok: true, playerFirst: true, report, deferredVisualSteps: DEFERRED_VISUAL_STEPS, at: Date.now() };
    olam.__mitzvahWorldPostBuildDone = true;
  }
  mark("ready-for-first-render", {
    playerFirst: true,
    animalsVisible: true,
    housesTight: true,
    vehicles: report.steps.vehicles?.vehicleCount || 0,
    deferredVisualSteps: DEFERRED_VISUAL_STEPS
  });
}

/** @param {object} context B"H postbuild context. */
export async function runMitzvahWorldPostBuild(context = {}) {
  const start = performance.now();
  mark("start", { source: sourceOf(context), playerFirst: true, fasterLoading: true, deferredVisualSteps: DEFERRED_VISUAL_STEPS });
  const regionStack = await safeStep("regionStack", () => ensureMitzvahRegionDirector(context));
  const livingRuntime = await safeStep("livingRegionRuntime", () => ensureLivingRegionRuntime(context, regionStack.value || {}));
  const vehicles = await safeStep("vehicles", () => ensureVehiclePostBuildLayer(context));
  const woodCollectibles = deferred("woodCollectibles");
  const roleMarkedNpcs = deferred("roleMarkedNpcs");
  const battleLayer = deferred("battleLayer", "fix VillageGroundNavigator import after playable frame");
  const finalGrounding = deferred("finalGrounding", "tight player ground is already active");
  const report = {
    skipped: false,
    playerFirst: true,
    reason: "minimal-postbuild-before-first-frame-bh1",
    source: sourceOf(context),
    elapsedMs: Math.round(performance.now() - start),
    deferredVisualSteps: DEFERRED_VISUAL_STEPS,
    steps: {
      regionStack: stepLine(regionStack, { summary: regionStack.value?.summary || null }),
      livingRegionRuntime: stepLine(livingRuntime, { stats: livingRuntime.value?.userData?.stats || null }),
      vehicles: stepLine(vehicles, { vehicleCount: vehicles.value?.vehicles?.length || 0, report: vehicles.value?.report || null }),
      woodCollectibles: stepLine(woodCollectibles, { authored: WOOD_COLLECTIBLES.length }),
      roleMarkedNpcs: stepLine(roleMarkedNpcs, { authored: Object.keys(NPC_ROLES).length }),
      battleLayer: stepLine(battleLayer),
      finalGrounding: stepLine(finalGrounding)
    }
  };
  finalizeReady(context, report);
  scheduleDeferred(context);
  mark("done", { elapsedMs: report.elapsedMs, playerFirst: true, deferred: true, vehicles: report.steps.vehicles.vehicleCount });
  return report;
}
