// B"H
/**
 * @file closePanels.js
 * @purpose Close top-level bridge panels without installing any action dock.
 * @owner Live mitzvahWorld UI bridge cleanup layer.
 * @inputs Existing DOM panel ids and optional Olam effects overlay.
 * @outputs Removed center content, closed side panels, and optional toast.
 * @runtimeAuthority Panel cleanup only; action ownership stays with canonical #actionBar.
 * @updateOrder Loaded before renderers and installUiBridge attach key handlers.
 * @callers uiBridge/renderers.js, uiBridge/installUiBridge.js, navDock compatibility.
 * @invariants Never creates #mitzvahActionDock or duplicate action buttons.
 * @failureModes Missing DOM roots are ignored so boot never fails during cleanup.
 */
import { clearCenter, closePanel } from "./domCore.js";
import { olamOf } from "./worldMarkers.js";

function toast(text) {
  olamOf(globalThis)?.ayshPeula?.("ui event", "effectsOverlay", {
    text,
    color: "#ffe680",
    source: "panel-cleanup"
  });
}

export function closeAllPanels() {
  clearCenter();
  ["uiGossip", "uiQuestPanel", "uiLootWindow", "uiSpiritHealer"].forEach(closePanel);
  toast("UI CLEARED");
}

export default closeAllPanels;
