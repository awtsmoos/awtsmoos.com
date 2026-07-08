// B"H
/** Small mutable touch state, so every finger has a named vessel. */
import { TAP_MS, TAP_PX } from "./MobileTouchConstants.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { point } from "./MobileTouchPackets.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function createMobileTouchState() { return { joystickTouchId:null, gazeTouchId:null, secondTouchId:null, initialJoyX:0, initialJoyY:0, lastGazePoint:null, lastPinchDist:0, tapStart:null }; }
export function beginTap(state, touch) { state.tapStart = { at:Date.now(), ...point(touch), targetTag:touch.target?.tagName || null }; }
export function isTap(state, touch, cancelled) {
  const start = state.tapStart;
  if (cancelled || !start) return false;
  const elapsed = Date.now() - Number(start.at || 0);
  const moved = Math.hypot(touch.pageX - start.pageX, touch.pageY - start.pageY);
  return elapsed <= TAP_MS && moved <= TAP_PX;
}
export function installMobileDiag(state) { window.__MITZVAH_MOBILE_TOUCH_DIAG__ = () => ({ touchEnabled:true, ...state, tapPx:TAP_PX, tapMs:TAP_MS }); }
