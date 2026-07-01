// B"H
/**
 * @file ui.js
 * @purpose Route worker UI events without letting legacy hide calls beat readiness.
 * @owner mitzvahWorld main-thread worker handler table.
 * @inputs worker UI messages and progress percentages.
 * @outputs DOM fallback actions, loading bridge updates, UI event acknowledgements.
 * @runtimeAuthority Veil lift requires LoadingProgress final proof.
 * @updateOrder progress -> bridge; hide request -> final check -> veil lift.
 * @callers worker message handler dispatch table.
 * @invariants hideLoadingScreen cannot expose gameplay before world_final_ready.
 * @failureModes unknown UI events fall through to direct fallback safely.
 */
import VeilController from "../../uiManager/logic/VeilController.js";
import LoadingProgress from "../../uiManager/logic/LoadingProgressBridge.js?v=real-final-ready-20260701-bh2";
import { DIRECT } from "./ui/domKit.js?v=npc-scroll-pass-through-20260609-bh638";
import { directFallback } from "./ui/fallbacks.js?v=village-polish-20260612-bh810";
import { showSpikeResetOverlay } from "./ui/effects.js?v=lava-camera-axis-20260609-bh640";
const percent = (data = {}) => Number.isFinite(Number(data.total)) ? Number(data.total) : Number.isFinite(Number(data.amount)) ? Number(data.amount) : 0;
const action = (data = {}) => data.action || data.stage || data.subAction || "Drawing Down the Infinite Light...";
function liftVeilOnlyWhenReady() { if (!LoadingProgress.hideLoading("ui hide request")) return false; VeilController.lift(); if (document?.body) document.body.style.overflow = "hidden"; return true; }
export default function uiHandlers(manager) {
  return {
    forceSpikeResetOverlay(payload) { showSpikeResetOverlay(manager, payload); },
    spikeResetComplete() {},
    spikeEnableComplete() {},
    hideLoadingScreen() { if (!liftVeilOnlyWhenReady()) LoadingProgress.update({ stage:"ui:hide-held", action:"Waiting for world", subAction:"world_final_ready not received" }); },
    increasedOlamLoading(data = {}) {
      const total = percent(data);
      LoadingProgress.update({ total, world:total, action:action(data), subAction:data.subAction || data.stage || "loading", log:data.subAction || data.action || data.stage });
      manager.myUi.htmlAction({ shaym:"loading bar", properties:{ style:{ width:`${total}%` } } });
      const bar = document.getElementById("genesisProgressBar"); if (bar) bar.style.width = `${Math.min(99, total)}%`;
    },
    resetPercentage() { LoadingProgress.update({ total:0, world:0, worker:0, texture:0, action:"Resetting vessels", subAction:"starting again" }); const bar = document.getElementById("genesisProgressBar"); if (bar) bar.style.width = "0%"; },
    sendUiEvent(data) {
      const { shaym, ob, id } = data || {};
      if (DIRECT.has(shaym)) directFallback(manager, shaym, ob);
      else { try { if (shaym && manager.myUi) manager.myUi.peula(shaym, ob, id); } catch {} directFallback(manager, shaym, ob); }
      if (id && manager.eved) manager.eved.postMessage({ type:"uiEvented", id });
    }
  };
}
