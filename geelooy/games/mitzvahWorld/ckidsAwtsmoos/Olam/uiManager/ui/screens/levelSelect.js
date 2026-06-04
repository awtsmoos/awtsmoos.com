// B"H
/**
 * @module levelSelect
 * @description
 * Chapter 397: The old level screen is also sealed against click-through.
 *
 * The NPC overlay owns the village flow, but this legacy board can still appear
 * through menus. It now seals pointer/touch/click events at the panel boundary
 * and exposes all twenty JSON challenge vessels.
 */
import { LevelDataMap } from "./levelSelect/LevelDataMap.js?v=twenty-open-levels-20260604-bh397";
import { LevelCardGenerator } from "./levelSelect/LevelCardGenerator.js?v=sealed-cards-20260604-bh397";

const LEVEL_BASE = "../../../../../levels/ladder/data/";
const FALLBACK_LEVEL = "ladder-1.json";
const allowedLevelIds = new Set(LevelDataMap.map(level => level.id));
function seal(event) { event?.preventDefault?.(); event?.stopPropagation?.(); event?.stopImmediatePropagation?.(); }
function installLevelSelectSeal(screen) { if (!screen || screen.__awtsmoosSealedLevelSelect) return; screen.__awtsmoosSealedLevelSelect = true; ["pointerdown", "pointerup", "click", "mousedown", "mouseup", "touchstart", "touchend"].forEach(type => screen.addEventListener(type, seal, true)); }
async function loadLevelData(levelId) {
  const safeId = allowedLevelIds.has(levelId) ? levelId : FALLBACK_LEVEL;
  const response = await fetch(new URL(LEVEL_BASE + safeId, import.meta.url), { cache: "no-store" });
  if (!response.ok) throw new Error(`JSON level fetch failed: ${safeId}`);
  const data = await response.json();
  if (data?.format !== "awtsmoos-level-json-v1" || !data?.nivrayim) throw new Error(`Invalid JSON level: ${safeId}`);
  return { id: safeId, data };
}
function hideSelector($) { $("levelSelectScreen")?.classList.add("hidden"); }

export default {
  shaym: "levelSelectScreen",
  className: "level-select-container hidden",
  awtsmoosClick: true,
  ready(e, $, ui) { installLevelSelectSeal($("levelSelectScreen")); },
  on: {
    open(e, $, ui) { seal(e); const screen = $("levelSelectScreen"); installLevelSelectSeal(screen); screen.classList.remove("hidden"); screen.classList.add("from-3d-village"); $("main menu")?.classList.add("hidden", "offscreen"); },
    close(e, $, ui) { seal(e); hideSelector($); },
    async launch(e, $, ui) {
      seal(e);
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
        { className: "ls-title", textContent: "NPC CHALLENGES — 20 LEVELS" },
        { tag: "button", className: "ls-close-btn", textContent: "X", onclick(e, $, ui) { seal(e); ui.peula($("levelSelectScreen"), { close: true }); } }
      ]
    }, { className: "ls-body", children: LevelCardGenerator.generate(LevelDataMap) }]
  }]
};
