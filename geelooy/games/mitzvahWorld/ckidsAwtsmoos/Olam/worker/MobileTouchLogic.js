// B"H
/** MobileTouchLogic — tiny entry point for the real finger path. */
import { attachMobileTouchHandlers } from "./mobileTouch/MobileTouchHandlers.js?compact=true&v=mobile-gameplay-revamp-20260705-bh1";
import { createMobileTouchState, installMobileDiag } from "./mobileTouch/MobileTouchState.js?compact=true&v=mobile-gameplay-revamp-20260705-bh1";
function hasRealTouch() { return "ontouchstart" in window || navigator.maxTouchPoints > 0 || /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent); }
export default function setupMobileTouchLogic(eved) {
  if (!hasRealTouch()) return;
  const state = createMobileTouchState();
  installMobileDiag(state);
  attachMobileTouchHandlers(eved, state);
}
