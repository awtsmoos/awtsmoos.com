// B"H
/** @file VillageWorldPolishPass.js @description Final polish audits trees, textures, grounding, and then signals readiness. */
import { ensureVillageLandmarkLayer } from "./VillageLandmarkLayer.js?v=village-landmarks-20260614-bh1";
import { ensureVillageAtmosphereLayer } from "./VillageAtmosphereLayer.js?v=village-atmosphere-20260614-bh1";
import { ensureVillageNpcLifeLayer } from "./VillageNpcLifeLayer.js?v=village-npc-life-20260614-bh1";
import { ensureVillageInteractionLayers } from "./VillageInteractionLayers.js?v=village-interaction-layers-20260614-bh1";
import { ensureTreeRuntimeAudit } from "./TreeRuntimeAudit.js?v=tree-runtime-audit-20260614-bh1";
import { ensureFinalGroundingPass } from "./FinalGroundingPass.js?v=final-grounding-20260614-bh1";
import { ensureRuntimeVisualAudit } from "./RuntimeVisualAudit.js?v=runtime-visual-audit-20260614-bh2";
import { signalWorldFinalReady } from "../runtime/WorldFinalReadySignal.js?v=awtsmoos-final-ready-20260614-bh2";
const KEY = "__awtsmoosVillageWorldPolishPass";
function progress(stage, data = {}) { if (typeof globalThis !== "undefined" && typeof globalThis.postMessage === "function") globalThis.postMessage({ type:"worker_progress", stage:`postbuild:${stage}`, ...data }); }
function message(error) { return error && error.message ? error.message : String(error); }
async function step(name, fn) { try { progress(`${name}:start`); const value = await fn(); progress(`${name}:done`); return { ok:true, value }; } catch (error) { const text = message(error); console.warn("B\"H | VILLAGE_POLISH_STEP_FAILED", { name, message:text }); return { ok:false, error:text }; } }
function added(result) { return result && result.value ? 1 : 0; }
function statsStations(result) { return result && result.value && result.value.userData && result.value.userData.stats ? result.value.userData.stats.stations || 0 : 0; }
function counts(result) { return result && result.value ? result.value.counts || null : null; }
function groundedCount(result) { return result && result.value ? result.value.grounded || 0 : 0; }
export async function ensureVillageWorldPolishPass(context = {}) {
  const olam = context.olam || context; if (!olam) return null; if (olam[KEY]) return olam[KEY];
  const landmarks = await step("landmarks", () => ensureVillageLandmarkLayer(context));
  const atmosphere = await step("atmosphere", () => ensureVillageAtmosphereLayer(context));
  const npcLife = await step("npcLife", () => ensureVillageNpcLifeLayer(context));
  const interaction = await step("interactionLayers", () => ensureVillageInteractionLayers(context));
  const grounding = await step("finalGrounding", () => ensureFinalGroundingPass(context));
  const treeAudit = await step("treeRuntimeAudit", () => ensureTreeRuntimeAudit(context));
  const visualAudit = await step("runtimeVisualAudit", () => ensureRuntimeVisualAudit(context));
  const all = [landmarks, atmosphere, npcLife, interaction, grounding, treeAudit, visualAudit];
  const result = { ok:all.every(x => x.ok), steps:{ landmarks:{ ok:landmarks.ok, added:added(landmarks), error:landmarks.error || null }, atmosphere:{ ok:atmosphere.ok, added:added(atmosphere), error:atmosphere.error || null }, npcLife:{ ok:npcLife.ok, added:added(npcLife), stations:statsStations(npcLife), error:npcLife.error || null }, interactionLayers:{ ok:interaction.ok, counts:counts(interaction), error:interaction.error || null }, finalGrounding:{ ok:grounding.ok, report:grounding.value || null, error:grounding.error || null }, treeRuntimeAudit:{ ok:treeAudit.ok, report:treeAudit.value || null, error:treeAudit.error || null }, runtimeVisualAudit:{ ok:visualAudit.ok, report:visualAudit.value || null, error:visualAudit.error || null } } };
  olam[KEY] = result; olam.__worldPostbuildReady = result; progress("ready-for-first-render", { grounded:groundedCount(grounding) }); signalWorldFinalReady(olam, { source:"postbuild" }); return result;
}
