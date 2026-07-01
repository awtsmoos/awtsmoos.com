// B"H
function awtsmoosNotice(message) {
  const text = String(message ?? "");
  console.warn('B"H | NOTICE_NO_BLOCKING_DIALOG', text);
  globalThis.__AWTSMOOS_SUPPRESSED_ALERTS__ ||= [];
  globalThis.__AWTSMOOS_SUPPRESSED_ALERTS__.push({ at: Date.now(), text, source: import.meta?.url || "unknown" });
  globalThis.__AWTSMOOS_SUPPRESSED_ALERTS__ = globalThis.__AWTSMOOS_SUPPRESSED_ALERTS__.slice(-80);
}
// B"H
/**
 * @module levelSelect
 * @description
 * Chapter 175: The level board has two gates now. JSON ladders open challenge
 * chambers; the Emerald card routes to the living district module itself.
 */
import { LevelDataMap } from "./levelSelect/LevelDataMap.js?v=emerald-card-living-district-20260607-bh174";
import { LevelCardGenerator } from "./levelSelect/LevelCardGenerator.js?v=sealed-cards-20260604-bh397";
const LEVEL_BASE = "../../../../../levels/ladder/data/";
const EMERALD_ROUTE = "/games/mitzvahWorld/ckidsAwtsmoos/tochen/worlds/emerald.js";
const FALLBACK_LEVEL = "ladder-1.json";
const allowedLevelIds = new Set(LevelDataMap.map(level => level.id));
function seal(event) { event?.preventDefault?.(); event?.stopPropagation?.(); event?.stopImmediatePropagation?.(); }
function installLevelSelectSeal(screen) { if (!screen || screen.__awtsmoosSealedLevelSelect) return; screen.__awtsmoosSealedLevelSelect = true; ["pointerdown", "pointerup", "click", "mousedown", "mouseup", "touchstart", "touchend"].forEach(type => screen.addEventListener(type, seal, true)); }
async function loadJsonLevel(levelId) {
  const safeId = allowedLevelIds.has(levelId) && levelId.endsWith(".json") ? levelId : FALLBACK_LEVEL;
  const response = await fetch(new URL(LEVEL_BASE + safeId, import.meta.url), { cache: "no-store" });
  if (!response.ok) throw new Error(`JSON level fetch failed: ${safeId}`);
  const data = await response.json();
  if (data?.format !== "awtsmoos-level-json-v1" || !data?.nivrayim) throw new Error(`Invalid JSON level: ${safeId}`);
  return { id: safeId, data };
}
async function loadEmeraldWorld() {
  const mod = await import(`${EMERALD_ROUTE}?v=level-select-living-district-bh175-${Date.now()}`);
  if (!mod.default?.nivrayim) throw new Error("Emerald world module did not export nivrayim");
  return { id: "emerald.js", data: mod.default };
}
async function loadLevelData(levelId) { return levelId === "emerald.js" ? loadEmeraldWorld() : loadJsonLevel(levelId); }
function hideSelector($) { $("levelSelectScreen")?.classList.add("hidden"); }
function launchDetail(id, data, gameUiHTML) { return id === "emerald.js" ? { worldDayuh: data, sourcePath: EMERALD_ROUTE, gameUiHTML } : { worldDayuh: data, sourcePath: id, gameUiHTML }; }
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
      const requestedLevel = e.detail || FALLBACK_LEVEL, ikar = $("ikar"), mm = $("main menu"), loading = $("loading"), gameUiHTML = mm ? mm.gameUiHTML : window.awtsmoosGameUI;
      try {
        if (loading) loading.classList.remove("hidden");
        const { id, data } = await loadLevelData(requestedLevel);
        ikar.dispatchEvent(new CustomEvent("start", { detail: launchDetail(id, data, gameUiHTML) }));
        hideSelector($);
      } catch (error) {
        console.error('B"H - Level select load failed:', error);
        awtsmoosNotice("Failed to load level: " + requestedLevel);
        if (loading) loading.classList.add("hidden");
      }
    }
  },
  children: [{ className: "ls-glass-panel", children: [{ className: "ls-header", children: [{ className: "ls-title", textContent: "NPC CHALLENGES — EMERALD + 20 LEVELS" }, { tag: "button", className: "ls-close-btn", textContent: "X", onclick(e, $, ui) { seal(e); ui.peula($("levelSelectScreen"), { close: true }); } }] }, { className: "ls-body", children: LevelCardGenerator.generate(LevelDataMap) }] }]
};
