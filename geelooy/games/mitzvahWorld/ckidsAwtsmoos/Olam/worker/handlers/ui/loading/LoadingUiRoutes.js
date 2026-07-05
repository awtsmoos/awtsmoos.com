// B"H
/** LoadingUiRoutes.js — worker loading events routed without progress backslide. */
import { action, monotonicFloor, percent } from "./LoadingUiMath.js?v=mitzvah-aggressive-split-20260703-bh1";

function setBar(width) {
  const bar = document.getElementById("genesisProgressBar");
  if (bar) bar.style.width = `${Math.min(99, Math.max(0, Number(width) || 0))}%`;
}

export function createLoadingRoutes(manager, LoadingProgress, VeilController) {
  const liftVeilOnlyWhenReady = () => {
    if (!LoadingProgress.hideLoading("ui hide request")) return false;
    VeilController.lift();
    if (document?.body) document.body.style.overflow = "hidden";
    return true;
  };
  return {
    hideLoadingScreen() {
      if (!liftVeilOnlyWhenReady()) LoadingProgress.update({ stage:"ui:hide-held", action:"Waiting for world", subAction:"world_final_ready not received" });
    },
    increasedOlamLoading(data = {}) {
      const total = Math.max(monotonicFloor(LoadingProgress, 0), percent(data));
      LoadingProgress.update({ total, world:total, action:action(data), subAction:data.subAction || data.stage || "loading", log:data.subAction || data.action || data.stage });
      manager.myUi.htmlAction({ shaym:"loading bar", properties:{ style:{ width:`${total}%` } } });
      setBar(total);
    },
    resetPercentage() {
      const total = monotonicFloor(LoadingProgress, 18);
      LoadingProgress.update({ total, world:Math.max(total, 18), worker:Math.max(total, 18), texture:Math.max(total, 8), action:"Continuing load...", subAction:"reset request ignored to preserve monotonic progress", stage:"ui:reset-held" });
      setBar(total);
    }
  };
}
