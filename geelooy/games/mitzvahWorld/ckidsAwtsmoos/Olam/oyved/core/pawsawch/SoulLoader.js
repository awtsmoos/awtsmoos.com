// B"H
/**
 * @module SoulLoader
 * @description
 * Chapter 109: after the souls appear, the earth claims them. The Awtsmoos
 * loads only explicit level manifests, snaps every eligible non-player entity
 * to the ground by its real mesh bounds, then warns only about true invaders.
 */
import { autoGroundNivrayim } from "./AutoGrounder.js?v=village-ground-20260531-bh109";

export class SoulLoader {
  /**
   * Loads only the direct level manifest.
   *
   * @param {any} olam Olam instance.
   * @param {object} payload Worker payload.
   * @returns {Promise<any[]>} Created Nivrayim.
   */
  static async load(olam, payload) {
    const worldData = payload.userInfo || payload;
    const nivrayimData = worldData.nivrayim || {};
    const loadStart = performance.now();
    const nivrayim = await olam.loadNivrayim(nivrayimData);
    const grounded = autoGroundNivrayim(nivrayim);
    const loadTime = (performance.now() - loadStart).toFixed(2);
    console.log(`B"H - Souls materialized in ${loadTime}ms. Auto-grounded ${grounded.snapped}/${grounded.checked}.`);
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

/**
 * Logs only true forbidden souls after explicit manifest load.
 *
 * @param {any[]} nivrayim Loaded entities.
 * @param {object} worldData Direct level data.
 * @returns {void}
 */
function reportForbiddenIfPresent(nivrayim = [], worldData = {}) {
  const bad = nivrayim.filter(nivra => forbiddenNivra(nivra, worldData));
  if (!bad.length) return;
  console.warn('B"H - Forbidden injected Nivrayim detected after load:', {
    source: worldData?.shaym,
    bad: bad.map(nivra => ({ name: nivra?.name, type: nivra?.type }))
  });
}
