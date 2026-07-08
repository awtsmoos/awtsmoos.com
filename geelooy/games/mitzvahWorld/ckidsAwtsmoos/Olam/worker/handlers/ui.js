// B"H
/** ui.js — compact facade; loading and event dispatch live in split modules. */
import VeilController from "../../uiManager/logic/VeilController.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import LoadingProgress from "../../uiManager/logic/LoadingProgressBridge.js?compact=true&v=loading-proof-mobile-20260706-bh3";
import { DIRECT } from "./ui/domKit.js?compact=true&v=mitzvah-aggressive-split-20260703-bh1";
import { directFallback } from "./ui/fallbacks.js?compact=true&v=door-roof-target-20260708-bh1";
import { showSpikeResetOverlay } from "./ui/effects.js?compact=true&v=lava-camera-axis-20260609-bh640";
import { createLoadingRoutes } from "./ui/loading/LoadingUiRoutes.js?compact=true&v=mitzvah-aggressive-split-20260703-bh1";
import { createUiEventRoute } from "./ui/loading/UiEventRoutes.js?compact=true&v=mitzvah-aggressive-split-20260703-bh1";

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
