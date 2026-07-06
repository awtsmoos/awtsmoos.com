// B"H
/** ui.js — compact facade; loading and event dispatch live in split modules. */
import VeilController from "../../uiManager/logic/VeilController.js";
import LoadingProgress from "../../uiManager/logic/LoadingProgressBridge.js?v=loading-proof-mobile-20260706-bh2";
import { DIRECT } from "./ui/domKit.js?v=mitzvah-aggressive-split-20260703-bh1";
import { directFallback } from "./ui/fallbacks.js?v=mitzvah-aggressive-split-20260703-bh1";
import { showSpikeResetOverlay } from "./ui/effects.js?v=lava-camera-axis-20260609-bh640";
import { createLoadingRoutes } from "./ui/loading/LoadingUiRoutes.js?v=mitzvah-aggressive-split-20260703-bh1";
import { createUiEventRoute } from "./ui/loading/UiEventRoutes.js?v=mitzvah-aggressive-split-20260703-bh1";

export default function uiHandlers(manager) {
  const loading = createLoadingRoutes(manager, LoadingProgress, VeilController);
  return {
    forceSpikeResetOverlay(payload) { showSpikeResetOverlay(manager, payload); },
    spikeResetComplete() {},
    spikeEnableComplete() {},
    ...loading,
    sendUiEvent: createUiEventRoute(manager, DIRECT, directFallback)
  };
}
