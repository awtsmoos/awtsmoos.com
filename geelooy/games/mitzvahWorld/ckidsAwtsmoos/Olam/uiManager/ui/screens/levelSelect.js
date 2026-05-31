// B"H
/**
 * @module levelSelect
 * @description
 * Chapter 95: the selector is no longer a fake village doorway. It is now a
 * challenge board summoned by a real NPC inside a real 3D village. Closing it
 * returns to the 3D world instead of resurrecting the removed UI village.
 */
import { LevelDataMap } from "./levelSelect/LevelDataMap.js";
import { LevelCardGenerator } from "./levelSelect/LevelCardGenerator.js";

const LEVEL_BASE = "../../../../../levels/ladder/data/";
const FALLBACK_LEVEL = "ladder-1.json";
const allowedLevelIds = new Set(LevelDataMap.map(level => level.id));

/** @param {string} levelId Requested JSON id. */
async function loadLevelData(levelId) {
  const safeId = allowedLevelIds.has(levelId) ? levelId : FALLBACK_LEVEL;
  const url = new URL(LEVEL_BASE + safeId, import.meta.url);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`JSON level fetch failed: ${safeId}`);
  const data = await response.json();
  if (data?.format !== "awtsmoos-level-json-v1" || !data?.nivrayim) throw new Error(`Invalid JSON level: ${safeId}`);
  return { id: safeId, data };
}

/** @param {Function} $ UI lookup. @returns {void} */
function hideSelector($) {
  $("levelSelectScreen")?.classList.add("hidden");
}

export default {
  shaym: "levelSelectScreen",
  className: "level-select-container hidden",
  awtsmoosClick: true,
  on: {
    open(e, $, ui) {
      const screen = $("levelSelectScreen");
      screen.classList.remove("hidden");
      screen.classList.add("from-3d-village");
      $("main menu")?.classList.add("hidden", "offscreen");
    },
    close(e, $, ui) { hideSelector($); },
    async launch(e, $, ui) {
      const requestedLevel = e.detail || FALLBACK_LEVEL;
      const ikar = $("ikar"), mm = $("main menu"), loading = $("loading");
      const gameUiHTML = mm ? mm.gameUiHTML : window.awtsmoosGameUI;
      try {
        if (loading) loading.classList.remove("hidden");
        const { id, data } = await loadLevelData(requestedLevel);
        ikar.dispatchEvent(new CustomEvent("start", { detail: { worldDayuh: data, sourcePath: id, gameUiHTML } }));
        hideSelector($);
      } catch (error) {
        console.error('B"H - Desert JSON level load failed:', error);
        alert("Failed to load Desert level: " + requestedLevel);
        if (loading) loading.classList.add("hidden");
      }
    }
  },
  children: [{
    className: "ls-glass-panel",
    children: [{
      className: "ls-header",
      children: [
        { className: "ls-title", textContent: "NPC CHALLENGES" },
        { tag: "button", className: "ls-close-btn", textContent: "X", onclick(e, $, ui) { ui.peula($("levelSelectScreen"), { close: true }); } }
      ]
    }, { className: "ls-body", children: LevelCardGenerator.generate(LevelDataMap) }]
  }]
};
