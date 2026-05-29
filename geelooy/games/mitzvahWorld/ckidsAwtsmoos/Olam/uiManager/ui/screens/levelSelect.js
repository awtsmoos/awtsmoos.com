// B"H
/**
 * @module levelSelect
 * @description Chapter 59: the menu fetches JSON level vessels; no authored
 * level JavaScript is imported by the UI.
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

export default {
  shaym: "levelSelectScreen",
  className: "level-select-container hidden",
  awtsmoosClick: true,
  on: {
    open(e, $, ui) {
      $("levelSelectScreen").classList.remove("hidden");
      const mm = $("main menu");
      if (mm) mm.classList.add("hidden", "offscreen");
    },
    close(e, $, ui) {
      $("levelSelectScreen").classList.add("hidden");
      const mm = $("main menu");
      if (mm) mm.classList.remove("hidden", "offscreen");
    },
    async launch(e, $, ui) {
      const requestedLevel = e.detail || FALLBACK_LEVEL;
      const ikar = $("ikar"), mm = $("main menu"), loading = $("loading");
      const gameUiHTML = mm ? mm.gameUiHTML : window.awtsmoosGameUI;
      try {
        if (loading) loading.classList.remove("hidden");
        const { id, data } = await loadLevelData(requestedLevel);
        ikar.dispatchEvent(new CustomEvent("start", { detail: { worldDayuh: data, sourcePath: id, gameUiHTML } }));
        $("levelSelectScreen").classList.add("hidden");
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
        { className: "ls-title", textContent: "DESERT LEVELS" },
        { tag: "button", className: "ls-close-btn", textContent: "X", onclick(e, $, ui) { ui.peula($("levelSelectScreen"), { close: true }); } }
      ]
    }, { className: "ls-body", children: LevelCardGenerator.generate(LevelDataMap) }]
  }]
};
