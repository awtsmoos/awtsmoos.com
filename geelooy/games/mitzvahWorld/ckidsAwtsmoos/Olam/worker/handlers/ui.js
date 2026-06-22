// B"H
/**
 * @module uiHandlers
 * @description
 * Chapter 433: loading progress becomes four visible rivers.
 * The Awtsmoos routes every worker percent into the direct DOM bridge before the
 * old UI abstraction can lose it, so mobile never stares at a silent bar.
 */
import VeilController from "../../uiManager/logic/VeilController.js";
import LoadingProgress from "../../uiManager/logic/LoadingProgressBridge.js?v=visible-canvas-watchdog-20260621-bh2";
import { DIRECT } from "./ui/domKit.js?v=npc-scroll-pass-through-20260609-bh638";
import { directFallback } from "./ui/fallbacks.js?v=village-polish-20260612-bh810";
import { showSpikeResetOverlay } from "./ui/effects.js?v=lava-camera-axis-20260609-bh640";
function percent(data = {}) { return Number.isFinite(Number(data.total)) ? Number(data.total) : Number.isFinite(Number(data.amount)) ? Number(data.amount) : 0; }
function action(data = {}) { return data.action || data.stage || data.subAction || "Drawing Down the Infinite Light..."; }
export default function uiHandlers(manager) {
  return {
    forceSpikeResetOverlay(payload) { showSpikeResetOverlay(manager, payload); },
    spikeResetComplete() {},
    spikeEnableComplete() {},
    hideLoadingScreen() { LoadingProgress.hideLoading(); VeilController.lift(); document.body.style.overflow = "hidden"; },
    increasedOlamLoading(data = {}) {
      const total = percent(data);
      LoadingProgress.update({ total, world: total, action: action(data), subAction: data.subAction || data.stage || "loading", log: data.subAction || data.action || data.stage });
      manager.myUi.htmlAction({ shaym: "loading bar", properties: { style: { width: `${total}%` } } });
      const bar = document.getElementById("genesisProgressBar");
      if (bar) bar.style.width = `${total}%`;
    },
    resetPercentage() { LoadingProgress.update({ total: 0, world: 0, worker: 0, texture: 0, action: "Resetting vessels", subAction: "starting again" }); const bar = document.getElementById("genesisProgressBar"); if (bar) bar.style.width = "0%"; },
    sendUiEvent(data) {
      const { shaym, ob, id } = data || {};
      if (DIRECT.has(shaym)) directFallback(manager, shaym, ob);
      else { try { if (shaym && manager.myUi) manager.myUi.peula(shaym, ob, id); } catch {} directFallback(manager, shaym, ob); }
      if (id && manager.eved) manager.eved.postMessage({ type: "uiEvented", id });
    }
  };
}
