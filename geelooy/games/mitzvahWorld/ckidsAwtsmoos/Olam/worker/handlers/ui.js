// B"H
/**
 * @module uiHandlers
 * @description
 * Chapter 167: The monolith shattered into six clear vessels. The Awtsmoos now
 * routes NPC dialogue, level select, stats, shop, HUD, and effects through small
 * modules that can be tested without tearing the whole sky.
 */
import VeilController from "../../uiManager/logic/VeilController.js";
import { DIRECT } from "./ui/domKit.js?v=npc-scroll-pass-through-20260609-bh638";
import { directFallback } from "./ui/fallbacks.js?v=lava-camera-axis-20260609-bh640";
import { showSpikeResetOverlay } from "./ui/effects.js?v=lava-camera-axis-20260609-bh640";

export default function uiHandlers(manager) {
  return {
    forceSpikeResetOverlay(payload) { showSpikeResetOverlay(manager, payload); },
    spikeResetComplete() {},
    spikeEnableComplete() {},
    hideLoadingScreen() { VeilController.lift(); document.body.style.overflow = "hidden"; },
    increasedOlamLoading(data) {
      const percent = (data?.amount || 0) + "%";
      manager.myUi.htmlAction({ shaym: "loading bar", properties: { style: { width: percent } } });
      const bar = document.getElementById("genesisProgressBar");
      if (bar) bar.style.width = percent;
    },
    resetPercentage() { const bar = document.getElementById("genesisProgressBar"); if (bar) bar.style.width = "0%"; },
    sendUiEvent(data) {
      const { shaym, ob, id } = data || {};
      if (DIRECT.has(shaym)) directFallback(manager, shaym, ob);
      else {
        try { if (shaym && manager.myUi) manager.myUi.peula(shaym, ob, id); } catch {}
        directFallback(manager, shaym, ob);
      }
      if (id && manager.eved) manager.eved.postMessage({ type: "uiEvented", id });
    }
  };
}
