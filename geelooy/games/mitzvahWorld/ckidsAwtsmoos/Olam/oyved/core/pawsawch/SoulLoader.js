// B"H
/**
 * @module SoulLoader
 * @description Chapter 574: Worker soul loading becomes measurable.
 * Village colliders are not baked during partial grounding; they bake once
 * after visual entities finish reaching their final poses. Now the worker also
 * reveals whether it paused before loadNivrayim, after loadNivrayim, or while
 * scheduling village grounding.
 */
import { autoGroundNivrayim } from "./AutoGrounder.js?v=ground-zero-non-village-20260602-bh126";
import { scheduleVillageGrounding } from "../../../methods/loadNivrayim/villageGrounding.js?v=final-colliders-after-settle-20260609-bh571";
import { postWorkerProgress } from "../protocol/WorkerProtocol.js";

function countAuthoredNivrayim(nivrayimData) {
  if (!nivrayimData || typeof nivrayimData !== "object") return 0;
  if (Array.isArray(nivrayimData)) return nivrayimData.length;
  return Object.keys(nivrayimData).length;
}

function worldProof(worldData, nivrayimData) {
  return {
    id: worldData?.id || null,
    shaym: worldData?.shaym || null,
    authoredNivrayim: countAuthoredNivrayim(nivrayimData)
  };
}

export class SoulLoader {
  static async load(olam, payload) {
    const worldData = payload.userInfo || payload;
    const nivrayimData = worldData.nivrayim || {};
    const loadStart = performance.now();
    postWorkerProgress("soul-loader:start", worldProof(worldData, nivrayimData));

    olam.baseInfo = worldData;
    postWorkerProgress("soul-loader:loadNivrayim:start");
    const nivrayim = await olam.loadNivrayim(nivrayimData);
    postWorkerProgress("soul-loader:loadNivrayim:done", {
      count: Array.isArray(nivrayim) ? nivrayim.length : 0,
      elapsedMs: Math.round(performance.now() - loadStart)
    });

    const grounded = worldData?.id === "village.json"
      ? { checked: 0, snapped: 0, skipped: nivrayim.length, villageRay: true }
      : autoGroundNivrayim(nivrayim);

    if (worldData?.id === "village.json") {
      postWorkerProgress("soul-loader:village-grounding:schedule:start", { count: nivrayim.length });
      scheduleVillageGrounding(olam, nivrayim);
      postWorkerProgress("soul-loader:village-grounding:schedule:done");
    }

    const loadTime = (performance.now() - loadStart).toFixed(2);
    console.log(`B"H - Souls materialized in ${loadTime}ms. Auto-grounded ${grounded.snapped}/${grounded.checked}; skipped ${grounded.skipped}; villageRay=${Boolean(grounded.villageRay)}.`);
    reportForbiddenIfPresent(nivrayim, worldData);
    postWorkerProgress("soul-loader:done", {
      count: Array.isArray(nivrayim) ? nivrayim.length : 0,
      elapsedMs: Math.round(performance.now() - loadStart),
      villageRay: Boolean(grounded.villageRay)
    });
    return nivrayim;
  }
}

function allowedVillageGuide(nivra, worldData) {
  return worldData?.id === "village.json" && nivra?.type === "interactiveNpc" && /Village Challenge Guide/i.test(nivra?.name || "");
}

function forbiddenNivra(nivra, worldData) {
  if (allowedVillageGuide(nivra, worldData)) return false;
  if (["customNpc", "medabeir", "mazik", "proceduralBuilding", "ProceduralBuilding"].includes(nivra?.type)) return true;
  return /enemy|husk/i.test(nivra?.name || "");
}

function reportForbiddenIfPresent(nivrayim = [], worldData = {}) {
  const bad = nivrayim.filter(nivra => forbiddenNivra(nivra, worldData));
  if (!bad.length) return;
  console.warn('B"H - Forbidden injected Nivrayim detected after load:', {
    source: worldData?.shaym,
    bad: bad.map(nivra => ({ name: nivra?.name, type: nivra?.type }))
  });
}
