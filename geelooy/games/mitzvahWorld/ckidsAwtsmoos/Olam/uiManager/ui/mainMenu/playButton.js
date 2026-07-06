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
 * @file playButton.js
 * @description
 * Chapter 95: "Enter World" now loads a real 3D village JSON vessel. No more
 * painted village overlay. The Awtsmoos sends the player into an actual Olam,
 * where a real NPC stands under sky and opens challenges by interaction.
 */
import mitzvahBtn from "../resources/mitzvahBtn.js";

const VILLAGE_ID = "village.json";
const LEVEL_BASE = "../../../../../levels/ladder/data/";

/** @param {string} id JSON level id. @returns {Promise<object>} */
async function fetchLevelData(id) {
  const url = new URL(LEVEL_BASE + id, import.meta.url);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`JSON level fetch failed: ${id}`);
  const data = await response.json();
  if (data?.format !== "awtsmoos-level-json-v1" || !data?.nivrayim) throw new Error(`Invalid JSON level vessel: ${id}`);
  return data;
}

/**
 * Launches the real 3D village world from the main menu.
 *
 * @param {object} gameUiHTML
 * Game UI vessel for the world HUD.
 *
 * @returns {object}
 * Button vessel.
 */
export default function playButton(gameUiHTML) {
  return mitzvahBtn({
    text: "PLAY WORLD",
    async onclick(e, $, ui) {
      const ikar = $("ikar"), mainMenu = $("main menu"), loading = $("loading");
      try {
        if (loading) loading.classList.remove("hidden");
        const worldDayuh = await fetchLevelData(VILLAGE_ID);
        mainMenu?.classList.add("hidden", "offscreen");
        ikar.dispatchEvent(new CustomEvent("start", { detail: { worldDayuh, sourcePath: VILLAGE_ID, gameUiHTML } }));
      } catch (error) {
        console.error('B"H - Real village load failed:', error);
        awtsmoosNotice("B\"H\nThe 3D village could not load yet.");
        if (loading) loading.classList.add("hidden");
      }
    }
  });
}

export function studioMenuButton() {
  return mitzvahBtn({
    text: "WORLD STUDIO",
    onclick() {
      window.location.href = "/games/mitzvahWorld/studio.html";
    }
  });
}

export function movieMakerMenuButton() {
  return mitzvahBtn({
    text: "MOVIE MAKER",
    onclick() {
      window.location.href = "/games/mitzvahWorld/movie.html";
    }
  });
}
