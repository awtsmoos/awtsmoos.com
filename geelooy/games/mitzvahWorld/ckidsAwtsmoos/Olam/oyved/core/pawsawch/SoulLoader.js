// B"H
/**
 * @module SoulLoader
 * @description
 * Chapter 169: Worker loader imports the authored-collider grounding seal. The
 * Awtsmoos keeps raised house colliders in the regular octree at authored Y.
 */
import { autoGroundNivrayim } from "./AutoGrounder.js?v=ground-zero-non-village-20260602-bh126";
import { scheduleVillageGrounding } from "../../../methods/loadNivrayim/villageGrounding.js?v=authored-collider-floor-20260602-bh169";

export class SoulLoader {
  static async load(olam, payload) {
    const worldData = payload.userInfo || payload;
    const nivrayimData = worldData.nivrayim || {};
    const loadStart = performance.now();
    olam.baseInfo = worldData;
    const nivrayim = await olam.loadNivrayim(nivrayimData);
    const grounded = worldData?.id === "village.json" ? { checked: 0, snapped: 0, skipped: nivrayim.length, villageRay: true } : autoGroundNivrayim(nivrayim);
    if (worldData?.id === "village.json") scheduleVillageGrounding(olam, nivrayim);
    const loadTime = (performance.now() - loadStart).toFixed(2);
    console.log(`B"H - Souls materialized in ${loadTime}ms. Auto-grounded ${grounded.snapped}/${grounded.checked}; skipped ${grounded.skipped}; villageRay=${Boolean(grounded.villageRay)}.`);
    reportForbiddenIfPresent(nivrayim, worldData);
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
  console.warn('B"H - Forbidden injected Nivrayim detected after load:', { source: worldData?.shaym, bad: bad.map(nivra => ({ name: nivra?.name, type: nivra?.type })) });
}
