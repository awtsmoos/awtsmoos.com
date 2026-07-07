// B"H
/**
 * Mobile touch covenant: joystick, camera drag, pinch zoom, and real tap
 * interaction each own their finger state explicitly.
 */
import SefiraOfInput from "./SefiraOfInput.js?v=npc-scroll-pass-through-20260609-bh638";
import { pinchPacket, touchDistance } from "./TouchPinchZoom.js?v=pinch-camera-zoom-20260706-bh1";

const SEAL = "multi-touch-joystick-camera-tap-20260707-bh1";
const WALK = ["KeyW", "KeyS", "KeyQ", "KeyE"];
const MOBILE_RE = /Mobile|Android|iPhone|iPad|iPod/i;
const TAP_PX = 16;
const TAP_MS = 520;

const list = value => Array.from(value || []);
const by = (touches, id) => list(touches).find(touch => touch.identifier === id);
const post = (worker, type, payload) => worker?.postMessage?.({ [type]:payload });
const isJoy = target => !!target?.closest?.("#joystick-container,#joystick-base,#joystick-thumb");
const isUi = target => SefiraOfInput.isUI(target) && !isJoy(target);

function touchCapable() {
  return typeof window !== "undefined"
    && ("ontouchstart" in window || navigator.maxTouchPoints > 0 || MOBILE_RE.test(navigator.userAgent || ""));
}

function settings() {
  try {
    return {
      deadzone:10,
      ...JSON.parse(localStorage.getItem("awtsmoosMobileSettings") || "{}"),
      naturalJoystick:true
    };
  } catch {
    return { deadzone:10, naturalJoystick:true };
  }
}

function trace(stage, payload = {}) {
  window.__AWTSMOOS_TOUCH_TRACE__ ||= [];
  window.__AWTSMOOS_TOUCH_TRACE__.push({ at:Date.now(), seal:SEAL, stage, ...payload });
  window.__AWTSMOOS_TOUCH_TRACE__ = window.__AWTSMOOS_TOUCH_TRACE__.slice(-120);
}

function touchPayload(touch, extra = {}) {
  return {
    button:0,
    buttons:extra.up ? 0 : 1,
    clientX:touch.clientX,
    clientY:touch.clientY,
    pageX:touch.pageX,
    pageY:touch.pageY,
    pointerType:"touch",
    pointerId:touch.identifier,
    identifier:touch.identifier,
    isTouch:true,
    touchEnabled:true,
    seal:SEAL,
    ...extra
  };
}

function thumb(dx, dy) {
  const el = document.getElementById("joystick-thumb");
  if (!el) return;
  const magnitude = Math.min(44, Math.hypot(dx, dy));
  const angle = Math.atan2(dy, dx);
  el.style.transform = `translate(${Math.cos(angle) * magnitude}px, ${Math.sin(angle) * magnitude}px)`;
}

function resetThumb() {
  const el = document.getElementById("joystick-thumb");
  if (el) el.style.transform = "translate(0,0)";
}

function analog(dx, dy) {
  const deadzone = Number(settings().deadzone) || 10;
  const length = Math.hypot(dx, dy);
  if (length < deadzone) return { vectorX:0, vectorY:0, pressed:false };
  const scale = Math.min(1, length / 58);
  return {
    vectorX:Math.max(-1, Math.min(1, dx / 58)) * scale,
    vectorY:Math.max(-1, Math.min(1, dy / 58)) * scale,
    pressed:true
  };
}

function desired(dx, dy) {
  const movement = analog(dx, dy);
  const deadzone = .18;
  const keys = new Set();
  if (!movement.pressed) return keys;
  if (movement.vectorY < -deadzone) keys.add("KeyW");
  if (movement.vectorY > deadzone) keys.add("KeyS");
  if (movement.vectorX < -deadzone) keys.add("KeyQ");
  if (movement.vectorX > deadzone) keys.add("KeyE");
  return keys;
}

function state(down, dx = 0, dy = 0) {
  const movement = analog(dx, dy);
  return {
    FORWARD:down.has("KeyW"),
    BACKWARD:down.has("KeyS"),
    LEFT_STRIDE:down.has("KeyQ"),
    RIGHT_STRIDE:down.has("KeyE"),
    vectorX:movement.vectorX,
    vectorY:movement.vectorY,
    analogActive:movement.pressed,
    screenRelative:true,
    source:"screen-vector-joystick",
    seal:SEAL,
    at:Date.now()
  };
}

function sync(worker, active, nextKeys, dx = 0, dy = 0) {
  for (const code of WALK) {
    const wants = nextKeys.has(code);
    const has = active.has(code);
    if (wants && !has) {
      post(worker, "keydown", { code, seal:SEAL });
      active.add(code);
    } else if (!wants && has) {
      post(worker, "keyup", { code, seal:SEAL });
      active.delete(code);
    }
  }
  post(worker, "mobileMove", state(nextKeys, dx, dy));
}

function release(worker, active) {
  sync(worker, active, new Set(), 0, 0);
  resetThumb();
  trace("joystick-release");
}

function drive(worker, origin, pointer, active, label) {
  const dx = pointer.pageX - origin.x;
  const dy = pointer.pageY - origin.y;
  const nextKeys = desired(dx, dy);
  thumb(dx, dy);
  sync(worker, active, nextKeys, dx, dy);
  trace("joystick-drive", {
    label,
    dx:Math.round(dx),
    dy:Math.round(dy),
    desired:[...nextKeys],
    quiet:true
  });
}

function bindPointer(worker, active) {
  let id = null;
  let origin = null;

  window.addEventListener("pointerdown", event => {
    if (event.pointerType === "touch" || !isJoy(event.target) || id !== null) return;
    id = event.pointerId;
    origin = { x:event.pageX, y:event.pageY };
    event.target?.setPointerCapture?.(id);
    drive(worker, origin, event, active, "pointer");
    event.preventDefault();
    event.stopPropagation();
  }, { passive:false, capture:true });

  window.addEventListener("pointermove", event => {
    if (event.pointerId !== id || !origin) return;
    drive(worker, origin, event, active, "pointer");
    event.preventDefault();
    event.stopPropagation();
  }, { passive:false, capture:true });

  const end = event => {
    if (event.pointerId !== id) return;
    id = null;
    origin = null;
    release(worker, active);
    event.preventDefault();
    event.stopPropagation();
  };

  window.addEventListener("pointerup", end, { passive:false, capture:true });
  window.addEventListener("pointercancel", end, { passive:false, capture:true });
}

function freeTouch(touches, ...used) {
  return list(touches).find(touch => !used.includes(touch.identifier) && !isJoy(touch.target) && !isUi(touch.target));
}

function adoptGaze(touches, joystickId, gazeId) {
  if (gazeId !== null && by(touches, gazeId)) return null;
  const next = freeTouch(touches, joystickId);
  return next ? { id:next.identifier, last:{ x:next.pageX, y:next.pageY }, start:tapStart(next) } : { id:null, last:null, start:null };
}

function adoptPinch(touches, joystickId, gazeId, pinchId) {
  if (pinchId !== null && by(touches, pinchId)) return null;
  const next = freeTouch(touches, joystickId, gazeId);
  return next ? { id:next.identifier } : { id:null };
}

function startJoystick(touch, active, worker) {
  const origin = { x:touch.pageX, y:touch.pageY };
  drive(worker, origin, touch, active, "touch");
  return origin;
}

function tapStart(touch) {
  return { at:Date.now(), pageX:touch.pageX, pageY:touch.pageY, clientX:touch.clientX, clientY:touch.clientY };
}

function isTap(start, touch, cancelled = false) {
  if (cancelled || !start) return false;
  const elapsed = Date.now() - Number(start.at || 0);
  const moved = Math.hypot(touch.pageX - start.pageX, touch.pageY - start.pageY);
  return elapsed <= TAP_MS && moved <= TAP_PX;
}

function startGaze(touch, worker) {
  const payload = touchPayload(touch, { phase:"start" });
  post(worker, "touchstart", payload);
  post(worker, "pointerdown", payload);
  trace("touch-start", { clientX:Math.round(touch.clientX), clientY:Math.round(touch.clientY) });
  return { last:{ x:touch.pageX, y:touch.pageY }, start:tapStart(touch) };
}

function finishGaze(touch, worker, start, cancelled = false) {
  const tap = isTap(start, touch, cancelled);
  const payload = touchPayload(touch, { phase:"end", up:true, tap });
  post(worker, "touchend", payload);
  post(worker, "pointerup", payload);
  post(worker, "mouseup", payload);
  if (tap) {
    post(worker, "mousedown", touchPayload(touch, { phase:"tap-click", tap:true }));
    post(worker, "combatSelectPointer", payload);
    post(worker, "interact", { ...payload, source:"mobile-tap-interact" });
    trace("tap-interact", { clientX:Math.round(touch.clientX), clientY:Math.round(touch.clientY) });
  }
}

function postCameraDrag(worker, gaze, last) {
  post(worker, "cameraDrag", {
    dx:(gaze.pageX - last.x) * 2.2,
    dy:(gaze.pageY - last.y) * 1.4,
    seal:SEAL,
    multiTouch:true
  });
}

function bindTouch(worker, active) {
  let joystickId = null;
  let joystickOrigin = null;
  let gazeId = null;
  let gazeLast = null;
  let gazeStart = null;
  let pinchId = null;
  let pinchDistance = 0;

  window.addEventListener("touchstart", event => {
    let owned = false;

    for (const touch of list(event.changedTouches)) {
      if (isJoy(touch.target) && joystickId === null) {
        joystickId = touch.identifier;
        joystickOrigin = startJoystick(touch, active, worker);
        owned = true;
        continue;
      }

      if (!isUi(touch.target) && gazeId === null) {
        gazeId = touch.identifier;
        const gaze = startGaze(touch, worker);
        gazeLast = gaze.last;
        gazeStart = gaze.start;
        owned = true;
        continue;
      }

      if (!isUi(touch.target) && pinchId === null && touch.identifier !== gazeId && !isJoy(touch.target)) {
        pinchId = touch.identifier;
        pinchDistance = touchDistance(by(event.touches, gazeId), touch);
        trace("pinch-start", { distance:Math.round(pinchDistance) });
        owned = true;
      }
    }

    if (owned) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, { passive:false, capture:true });

  window.addEventListener("touchmove", event => {
    let owned = false;
    const joy = by(event.touches, joystickId);

    if (joy && joystickOrigin) {
      drive(worker, joystickOrigin, joy, active, "touch");
      owned = true;
    }

    const adopted = adoptGaze(event.touches, joystickId, gazeId);
    if (adopted) {
      gazeId = adopted.id;
      gazeLast = adopted.last;
      gazeStart = adopted.start;
    }

    const pinchAdopted = adoptPinch(event.touches, joystickId, gazeId, pinchId);
    if (pinchAdopted) pinchId = pinchAdopted.id;

    const gaze = by(event.touches, gazeId);
    const pinch = by(event.touches, pinchId);

    if (gaze && pinch) {
      const next = pinchPacket(pinchDistance || touchDistance(gaze, pinch), gaze, pinch, SEAL);
      if (next.wheel.deltaY) post(worker, "wheel", next.wheel);
      pinchDistance = next.nextDistance;
      gazeLast = { x:gaze.pageX, y:gaze.pageY };
      gazeStart = null;
      owned = true;
      trace("pinch-zoom", { deltaY:Math.round(next.wheel.deltaY), distance:Math.round(pinchDistance), quiet:true });
    } else if (gaze && gazeLast) {
      if (gazeStart && Math.hypot(gaze.pageX - gazeStart.pageX, gaze.pageY - gazeStart.pageY) > TAP_PX) gazeStart = null;
      postCameraDrag(worker, gaze, gazeLast);
      gazeLast = { x:gaze.pageX, y:gaze.pageY };
      owned = true;
    }

    if (owned) event.preventDefault();
  }, { passive:false, capture:true });

  const end = (event, cancelled = false) => {
    let ended = false;

    for (const touch of list(event.changedTouches)) {
      if (touch.identifier === joystickId) {
        joystickId = null;
        joystickOrigin = null;
        release(worker, active);
        ended = true;
      }
      if (touch.identifier === gazeId) {
        finishGaze(touch, worker, gazeStart, cancelled);
        gazeId = null;
        gazeLast = null;
        gazeStart = null;
        ended = true;
      }
      if (touch.identifier === pinchId) {
        pinchId = null;
        pinchDistance = 0;
        ended = true;
      }
    }

    const adopted = adoptGaze(event.touches, joystickId, gazeId);
    if (adopted) {
      gazeId = adopted.id;
      gazeLast = adopted.last;
      gazeStart = adopted.start;
    }

    const pinchAdopted = adoptPinch(event.touches, joystickId, gazeId, pinchId);
    if (pinchAdopted) pinchId = pinchAdopted.id;
    if (pinchId !== null && gazeId !== null) pinchDistance = touchDistance(by(event.touches, gazeId), by(event.touches, pinchId));
    if (ended) event.preventDefault?.();
  };

  window.addEventListener("touchend", event => end(event, false), { passive:false, capture:true });
  window.addEventListener("touchcancel", event => end(event, true), { passive:false, capture:true });
}

export default class TouchOrchestrator {
  static bind(worker) {
    trace("bind-attempt", { prev:window.__awtsmoosTouchOrchestratorBound, touchCapable:touchCapable() });
    if (window.__awtsmoosTouchOrchestratorBound === SEAL) return;
    window.__awtsmoosTouchOrchestratorBound = SEAL;
    const active = new Set();
    bindPointer(worker, active);
    bindTouch(worker, active);
    trace("bind-complete", { seal:SEAL });
  }
}
