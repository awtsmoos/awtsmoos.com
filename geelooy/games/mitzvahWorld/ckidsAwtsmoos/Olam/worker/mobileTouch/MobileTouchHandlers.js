// B"H
/** Touch handlers: preview on touchstart, action on touchend, no hover myth. */
import { GAZE_SCALE, PINCH_SCALE, TAP_PX } from "./MobileTouchConstants.js";
import { distance, packet, point, transmit, uiBlocked } from "./MobileTouchPackets.js";
import { beginTap, isTap } from "./MobileTouchState.js";
import { releaseJoystick, resetJoystick, steer } from "./MobileJoystick.js";
export function attachMobileTouchHandlers(eved, state) {
  const send = (type, payload = {}) => transmit(eved, type, payload);
  window.addEventListener("touchstart", e => start(e, state, send), { passive:false });
  window.addEventListener("touchmove", e => move(e, state, send), { passive:false });
  window.addEventListener("touchend", e => end(e, state, send, false), { passive:false });
  window.addEventListener("touchcancel", e => end(e, state, send, true), { passive:false });
}
function start(e, state, send) {
  for (const touch of e.changedTouches) {
    if (touch.target?.closest?.("#joystick-base")) { startJoystick(state, touch); continue; }
    if (uiBlocked(touch)) continue;
    if (state.gazeTouchId === null) startGaze(state, touch, send);
    else if (state.secondTouchId === null) startPinch(state, e, touch);
  }
}
function startJoystick(state, touch) { if (state.joystickTouchId !== null) return; state.joystickTouchId = touch.identifier; state.initialJoyX = touch.pageX; state.initialJoyY = touch.pageY; }
function startGaze(state, touch, send) { state.gazeTouchId = touch.identifier; state.lastGazePoint = { x:touch.pageX, y:touch.pageY }; beginTap(state, touch); const p = packet(touch, { phase:"start" }); ["pointerdown", "touchstart", "mousedown", "combatSelectPointer"].forEach(type => send(type, p)); }
function startPinch(state, e, touch) { state.secondTouchId = touch.identifier; const first = [...e.touches].find(t => t.identifier === state.gazeTouchId); if (first) state.lastPinchDist = distance(first, touch); }
function move(e, state, send) {
  const t1 = [...e.touches].find(t => t.identifier === state.gazeTouchId), t2 = [...e.touches].find(t => t.identifier === state.secondTouchId);
  if (t1 && t2) return pinch(e, state, t1, t2, send);
  if (t1 && state.lastGazePoint) gaze(e, state, t1, send);
  const joy = [...e.touches].find(t => t.identifier === state.joystickTouchId);
  if (joy) { steer(joy.pageX - state.initialJoyX, joy.pageY - state.initialJoyY, send); prevent(e); }
}
function pinch(e, state, t1, t2, send) { const d = distance(t1, t2); send("wheel", { deltaY:-(d - state.lastPinchDist) * PINCH_SCALE, source:"mobile-pinch" }); state.lastPinchDist = d; prevent(e); }
function gaze(e, state, touch, send) { const dx = touch.pageX - state.lastGazePoint.x, dy = touch.pageY - state.lastGazePoint.y; send("cameraDrag", { dx:dx * GAZE_SCALE, dy:dy * GAZE_SCALE, source:"mobile-gaze" }); state.lastGazePoint = { x:touch.pageX, y:touch.pageY }; if (distance(point(touch), state.tapStart || {}) > TAP_PX) state.tapStart = null; prevent(e); }
function end(e, state, send, cancelled) { for (const touch of e.changedTouches) { endJoystick(state, touch, send); endGaze(state, touch, send, cancelled); endPinch(state, touch); } }
function endJoystick(state, touch, send) { if (touch.identifier !== state.joystickTouchId) return; state.joystickTouchId = null; resetJoystick(); releaseJoystick(send); }
function endGaze(state, touch, send, cancelled) { if (touch.identifier !== state.gazeTouchId) return; const p = packet(touch, { phase:"end", up:true, tap:isTap(state, touch, cancelled) }); ["pointerup", "touchend", "mouseup"].forEach(type => send(type, p)); if (p.tap) { send("combatSelectPointer", p); send("interact", { ...p, source:"mobile-tap-interact" }); } state.gazeTouchId = null; state.lastGazePoint = null; state.tapStart = null; }
function endPinch(state, touch) { if (touch.identifier === state.secondTouchId) { state.secondTouchId = null; state.lastPinchDist = 0; } }
function prevent(e) { if (e.cancelable) e.preventDefault(); }
