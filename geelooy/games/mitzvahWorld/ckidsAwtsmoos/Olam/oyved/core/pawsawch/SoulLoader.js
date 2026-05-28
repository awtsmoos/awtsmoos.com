// B"H
/**
 * @module SoulLoader
 * @description
 * Chapter 3: The postbuild army is banished from Dust Gate.
 *
 * This worker loader now does one thing for the clean Level 1 pipeline: it
 * loads the explicit `nivrayim` manifest that arrived from `ladder-1.js`.
 * It does not import MitzvahWorldPostBuild, GeneratedBattleLayer, NPC role
 * repairs, house repairs, or any automatic population script. Those postbuild
 * systems were the hidden doorway that could add enemies/NPCs after the level
 * data itself was already clean.
 */

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
    const loadTime = (performance.now() - loadStart).toFixed(2);

    console.log(`B"H - Souls materialized in ${loadTime}ms. Postbuild injection skipped.`);
    reportForbiddenIfPresent(nivrayim, worldData);
    return nivrayim;
  }
}

/**
 * Logs loudly if anything forbidden appears after the explicit manifest load.
 *
 * @param {any[]} nivrayim Loaded entities.
 * @param {object} worldData Direct level data.
 * @returns {void}
 */
function reportForbiddenIfPresent(nivrayim = [], worldData = {}) {
  const forbiddenTypes = new Set([
    "interactiveNpc",
    "customNpc",
    "medabeir",
    "mazik",
    "proceduralBuilding",
    "ProceduralBuilding"
  ]);
  const bad = nivrayim.filter(nivra => forbiddenTypes.has(nivra?.type) || /npc|enemy|husk/i.test(nivra?.name || ""));
  if (!bad.length) return;
  console.warn('B"H - Forbidden injected Nivrayim detected after load:', {
    source: worldData?.shaym,
    bad: bad.map(nivra => ({ name: nivra?.name, type: nivra?.type }))
  });
}
