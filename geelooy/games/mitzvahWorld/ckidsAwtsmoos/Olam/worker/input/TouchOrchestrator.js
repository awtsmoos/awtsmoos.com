// B"H
/**
 * Mobile touch covenant: joystick, camera drag, and pinch zoom each own their
 * finger state explicitly so one gesture never steals another gesture mid-frame.
 */
import SefiraOfInput from './SefiraOfInput.js?v=npc-scroll-pass-through-20260609-bh638';
import { pinchPacket, touchDistance } from './TouchPinchZoom.js?v=pinch-camera-zoom-20260706-bh1';

const SEAL = 'multi-touch-joystick-camera-20260702-bh6';
const WALK = ['KeyW', 'KeyS', 'KeyQ', 'KeyE'];
const MOBILE_RE = /Mobile|Android|iPhone|iPad|iPod/i;

const list = value => Array.from(value || []);
const by = (touches, id) => list(touches).find(touch => touch.identifier === id);
const post = (w, t, p) => w?.postMessage?.({ [t]:p });
const isJoy = t => !!t?.closest?.('#joystick-container,#joystick-base,#joystick-thumb');
const isUi = t => SefiraOfInput.isUI(t) && !isJoy(t);

function touchCapable() {
  return typeof window !== 'undefined'
    && ('ontouchstart' in window || navigator.maxTouchPoints > 0 || MOBILE_RE.test(navigator.userAgent || ''));
}

function settings() {
  try {
    return {
      deadzone:10,
      ...JSON.parse(localStorage.getItem('awtsmoosMobileSettings') || '{}'),
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

function thumb(dx, dy) {
  const el = document.getElementById('joystick-thumb');
  if (!el) return;
  const magnitude = Math.min(44, Math.hypot(dx, dy));
  const angle = Math.atan2(dy, dx);
  el.style.transform = `translate(${Math.cos(angle) * magnitude}px, ${Math.sin(angle) * magnitude}px)`;
}

function resetThumb() {
  const el = document.getElementById('joystick-thumb');
  if (el) el.style.transform = 'translate(0,0)';
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
  if (movement.vectorY < -deadzone) keys.add('KeyW');
  if (movement.vectorY > deadzone) keys.add('KeyS');
  if (movement.vectorX < -deadzone) keys.add('KeyQ');
  if (movement.vectorX > deadzone) keys.add('KeyE');
  return keys;
}

function state(down, dx = 0, dy = 0) {
  const movement = analog(dx, dy);
  return {
    FORWARD:down.has('KeyW'),
    BACKWARD:down.has('KeyS'),
    LEFT_STRIDE:down.has('KeyQ'),
    RIGHT_STRIDE:down.has('KeyE'),
    vectorX:movement.vectorX,
    vectorY:movement.vectorY,
    analogActive:movement.pressed,
    screenRelative:true,
    source:'screen-vector-joystick',
    seal:SEAL,
    at:Date.now()
  };
}

function sync(worker, active, nextKeys, dx = 0, dy = 0) {
  for (const code of WALK) {
    const wants = nextKeys.has(code);
    const has = active.has(code);
    if (wants && !has) {
      post(worker, 'keydown', { code, seal:SEAL });
      active.add(code);
    } else if (!wants && has) {
      post(worker, 'keyup', { code, seal:SEAL });
      active.delete(code);
    }
  }
  post(worker, 'mobileMove', state(nextKeys, dx, dy));
}

function release(worker, active) {
  sync(worker, active, new Set(), 0, 0);
  resetThumb();
  trace('joystick-release');
}

function drive(worker, origin, pointer, active, label) {
  const dx = pointer.pageX - origin.x;
  const dy = pointer.pageY - origin.y;
  const nextKeys = desired(dx, dy);
  thumb(dx, dy);
  sync(worker, active, nextKeys, dx, dy);
  trace('joystick-drive', {
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

  window.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch' || !isJoy(e.target) || id !== null) return;
    id = e.pointerId;
    origin = { x:e.pageX, y:e.pageY };
    e.target?.setPointerCapture?.(id);
    drive(worker, origin, e, active, 'pointer');
    e.preventDefault();
    e.stopPropagation();
  }, { passive:false, capture:true });

  window.addEventListener('pointermove', e => {
    if (e.pointerId !== id || !origin) return;
    drive(worker, origin, e, active, 'pointer');
    e.preventDefault();
    e.stopPropagation();
  }, { passive:false, capture:true });

  const end = e => {
    if (e.pointerId !== id) return;
    id = null;
    origin = null;
    release(worker, active);
    e.preventDefault();
    e.stopPropagation();
  };

  window.addEventListener('pointerup', end, { passive:false, capture:true });
  window.addEventListener('pointercancel', end, { passive:false, capture:true });
}

function freeTouch(touches, ...used) {
  return list(touches).find(t => !used.includes(t.identifier) && !isJoy(t.target) && !isUi(t.target));
}

function adoptGaze(touches, joystickId, gazeId) {
  if (gazeId !== null && by(touches, gazeId)) return null;
  const next = freeTouch(touches, joystickId);
  return next ? { id:next.identifier, last:{ x:next.pageX, y:next.pageY } } : { id:null, last:null };
}

function adoptPinch(touches, joystickId, gazeId, pinchId) {
  if (pinchId !== null && by(touches, pinchId)) return null;
  const next = freeTouch(touches, joystickId, gazeId);
  return next ? { id:next.identifier } : { id:null };
}

function startJoystick(touch, active, worker) {
  const origin = { x:touch.pageX, y:touch.pageY };
  drive(worker, origin, touch, active, 'touch');
  return origin;
}

function startGaze(touch, worker) {
  post(worker, 'touchstart', {
    button:0,
    clientX:touch.clientX,
    clientY:touch.clientY,
    pointerType:'touch',
    isTouch:true,
    seal:SEAL
  });
  return { x:touch.pageX, y:touch.pageY };
}

function postCameraDrag(worker, gaze, last) {
  post(worker, 'cameraDrag', {
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
  let pinchId = null;
  let pinchDistance = 0;

  window.addEventListener('touchstart', e => {
    let owned = false;

    for (const touch of list(e.changedTouches)) {
      if (isJoy(touch.target) && joystickId === null) {
        joystickId = touch.identifier;
        joystickOrigin = startJoystick(touch, active, worker);
        owned = true;
        continue;
      }

      if (!isUi(touch.target) && gazeId === null) {
        gazeId = touch.identifier;
        gazeLast = startGaze(touch, worker);
        owned = true;
        continue;
      }

      if (!isUi(touch.target) && pinchId === null && touch.identifier !== gazeId && !isJoy(touch.target)) {
        pinchId = touch.identifier;
        pinchDistance = touchDistance(by(e.touches, gazeId), touch);
        trace('pinch-start', { distance:Math.round(pinchDistance) });
        owned = true;
      }
    }

    if (owned) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, { passive:false, capture:true });

  window.addEventListener('touchmove', e => {
    let owned = false;
    const joy = by(e.touches, joystickId);

    if (joy && joystickOrigin) {
      drive(worker, joystickOrigin, joy, active, 'touch');
      owned = true;
    }

    const adopted = adoptGaze(e.touches, joystickId, gazeId);
    if (adopted) {
      gazeId = adopted.id;
      gazeLast = adopted.last;
    }

    const pinchAdopted = adoptPinch(e.touches, joystickId, gazeId, pinchId);
    if (pinchAdopted) pinchId = pinchAdopted.id;

    const gaze = by(e.touches, gazeId);
    const pinch = by(e.touches, pinchId);

    if (gaze && pinch) {
      const next = pinchPacket(pinchDistance || touchDistance(gaze, pinch), gaze, pinch, SEAL);
      if (next.wheel.deltaY) post(worker, 'wheel', next.wheel);
      pinchDistance = next.nextDistance;
      gazeLast = { x:gaze.pageX, y:gaze.pageY };
      owned = true;
      trace('pinch-zoom', {
        deltaY:Math.round(next.wheel.deltaY),
        distance:Math.round(pinchDistance),
        quiet:true
      });
    } else if (gaze && gazeLast) {
      postCameraDrag(worker, gaze, gazeLast);
      gazeLast = { x:gaze.pageX, y:gaze.pageY };
      owned = true;
    }

    if (owned) e.preventDefault();
  }, { passive:false, capture:true });

  const end = e => {
    let ended = false;

    for (const touch of list(e.changedTouches)) {
      if (touch.identifier === joystickId) {
        joystickId = null;
        joystickOrigin = null;
        release(worker, active);
        ended = true;
      }
      if (touch.identifier === gazeId) {
        gazeId = null;
        gazeLast = null;
        ended = true;
      }
      if (touch.identifier === pinchId) {
        pinchId = null;
        pinchDistance = 0;
        ended = true;
      }
    }

    const adopted = adoptGaze(e.touches, joystickId, gazeId);
    if (adopted) {
      gazeId = adopted.id;
      gazeLast = adopted.last;
    }

    const pinchAdopted = adoptPinch(e.touches, joystickId, gazeId, pinchId);
    if (pinchAdopted) pinchId = pinchAdopted.id;
    if (pinchId !== null && gazeId !== null) {
      pinchDistance = touchDistance(by(e.touches, gazeId), by(e.touches, pinchId));
    }
    if (ended) e.preventDefault?.();
  };

  window.addEventListener('touchend', end, { passive:false, capture:true });
  window.addEventListener('touchcancel', end, { passive:false, capture:true });
}

export default class TouchOrchestrator {
  static bind(worker) {
    trace('bind-attempt', {
      prev:window.__awtsmoosTouchOrchestratorBound,
      touchCapable:touchCapable()
    });
    if (window.__awtsmoosTouchOrchestratorBound === SEAL) return;
    window.__awtsmoosTouchOrchestratorBound = SEAL;
    const active = new Set();
    bindPointer(worker, active);
    bindTouch(worker, active);
    trace('bind-complete', { seal:SEAL });
  }
}
