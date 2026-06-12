// B"H
/**
 * @file TouchOrchestrator.js
 * @description
 * Chapter 427: The joystick seal and body seal are one.
 *
 * The Awtsmoos showed the missing proof: DOM events could bind under one seal
 * while the Chossid body was repaired under another. This vessel binds pointer
 * and touch movement with the visible-root seal, logs every guard, and sends
 * direct `mobileMove` truth into the worker so controls and physics can prove
 * the same body moved.
 */
import SefiraOfInput from './SefiraOfInput.js?v=npc-scroll-pass-through-20260609-bh638';

const SEAL = 'visible-root-binding-20260610-bh710';
const WALK_KEYS = ['KeyW', 'KeyS', 'KeyQ', 'KeyE'];
const DEAD_ZONE = 10;
const MAX_THUMB = 48;
const touchCapable = () => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0 || /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || ''));
const touchList = list => Array.from(list || []);
const byId = (touches, id) => touchList(touches).find(t => t.identifier === id);
const dist = (a, b) => Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
const post = (worker, type, payload) => worker?.postMessage?.({ [type]: payload });

function trace(stage, payload = {}) {
  const at = Date.now();
  window.__AWTSMOOS_TOUCH_TRACE__ ||= [];
  window.__AWTSMOOS_TOUCH_TRACE__.push({ at, seal: SEAL, stage, ...payload });
  window.__AWTSMOOS_TOUCH_TRACE__ = window.__AWTSMOOS_TOUCH_TRACE__.slice(-140);
  if (!payload.quiet && window.__AWTSMOOS_INPUT_TRACE__ === true) console.info('B"H | TOUCH_ORCHESTRATOR_TRACE', { seal: SEAL, stage, ...payload });
}

function isJoystickTarget(target) { return !!target?.closest?.('#joystick-container, #joystick-base, #joystick-thumb'); }
function isUiTarget(target) { return SefiraOfInput.isUI(target) && !isJoystickTarget(target); }
function moveThumb(dx, dy) { const thumb = document.getElementById('joystick-thumb'); if (!thumb) return; const angle = Math.atan2(dy, dx), amount = Math.min(MAX_THUMB, Math.hypot(dx, dy)); thumb.style.transform = `translate(${Math.cos(angle) * amount}px, ${Math.sin(angle) * amount}px)`; }
function resetThumb() { const thumb = document.getElementById('joystick-thumb'); if (thumb) thumb.style.transform = 'translate(0, 0)'; }
function desiredFromDelta(dx, dy) { const desired = new Set(); if (Math.hypot(dx, dy) >= DEAD_ZONE) { if (dy < -DEAD_ZONE) desired.add('KeyW'); if (dy > DEAD_ZONE) desired.add('KeyS'); if (dx < -DEAD_ZONE) desired.add('KeyQ'); if (dx > DEAD_ZONE) desired.add('KeyE'); } return desired; }
function directState(desired) { return { FORWARD: desired.has('KeyW'), BACKWARD: desired.has('KeyS'), LEFT_STRIDE: desired.has('KeyQ'), RIGHT_STRIDE: desired.has('KeyE'), source: 'wall-joystick', seal: SEAL, at: Date.now() }; }

function syncWalkKeys(worker, active, desired) {
  for (const code of WALK_KEYS) {
    const wants = desired.has(code), has = active.has(code);
    if (wants && !has) { post(worker, 'keydown', { code, seal: SEAL }); active.add(code); }
    else if (!wants && has) { post(worker, 'keyup', { code, seal: SEAL }); active.delete(code); }
  }
  post(worker, 'mobileMove', directState(desired));
}

function releaseWalk(worker, active) {
  syncWalkKeys(worker, active, new Set());
  resetThumb();
  trace('joystick-release', { active: [] });
}

function drive(worker, origin, point, active, label) {
  const dx = point.pageX - origin.x, dy = point.pageY - origin.y;
  moveThumb(dx, dy);
  const desired = desiredFromDelta(dx, dy);
  syncWalkKeys(worker, active, desired);
  trace('joystick-drive', { label, desired: [...desired], dx: Math.round(dx), dy: Math.round(dy), quiet: true });
}

function bindPointer(worker, active) {
  let pointerId = null, origin = null;
  window.addEventListener('pointerdown', event => {
    if (!isJoystickTarget(event.target) || pointerId !== null) return;
    pointerId = event.pointerId;
    origin = { x: event.pageX, y: event.pageY };
    event.target?.setPointerCapture?.(pointerId);
    drive(worker, origin, event, active, 'pointer');
    trace('pointer-start', { pointerId, target: event.target?.id || event.target?.tagName });
    event.preventDefault(); event.stopPropagation();
  }, { passive: false, capture: true });
  window.addEventListener('pointermove', event => {
    if (event.pointerId !== pointerId || !origin) return;
    drive(worker, origin, event, active, 'pointer');
    event.preventDefault(); event.stopPropagation();
  }, { passive: false, capture: true });
  const end = event => {
    if (event.pointerId !== pointerId) return;
    pointerId = null;
    origin = null;
    releaseWalk(worker, active);
    event.preventDefault(); event.stopPropagation();
  };
  window.addEventListener('pointerup', end, { passive: false, capture: true });
  window.addEventListener('pointercancel', end, { passive: false, capture: true });
}

function bindTouch(worker, active) {
  let joystickId = null, joystickOrigin = null, gazeId = null, gazeLast = null, pinchId = null, pinchLastDistance = 0;
  window.addEventListener('touchstart', event => {
    for (const touch of touchList(event.changedTouches)) {
      if (isJoystickTarget(touch.target) && joystickId === null) {
        joystickId = touch.identifier;
        joystickOrigin = { x: touch.pageX, y: touch.pageY };
        drive(worker, joystickOrigin, touch, active, 'touch');
        trace('touch-start', { id: joystickId, target: touch.target?.id || touch.target?.tagName });
        event.preventDefault(); event.stopPropagation();
        continue;
      }
      if (isUiTarget(touch.target)) continue;
      if (gazeId === null) {
        gazeId = touch.identifier;
        gazeLast = { x: touch.pageX, y: touch.pageY };
        post(worker, 'mousedown', { button: 2, clientX: touch.clientX, clientY: touch.clientY, seal: SEAL });
      } else if (pinchId === null && touch.identifier !== gazeId) {
        pinchId = touch.identifier;
        const first = byId(event.touches, gazeId);
        if (first) pinchLastDistance = dist(first, touch);
      }
      event.preventDefault();
    }
  }, { passive: false, capture: true });
  window.addEventListener('touchmove', event => {
    const joy = byId(event.touches, joystickId);
    if (joy && joystickOrigin) drive(worker, joystickOrigin, joy, active, 'touch');
    const gaze = byId(event.touches, gazeId), pinch = byId(event.touches, pinchId);
    if (gaze && pinch) {
      const nextDistance = dist(gaze, pinch), delta = nextDistance - pinchLastDistance;
      if (Math.abs(delta) > 1) post(worker, 'wheel', { deltaY: -delta * 3.5, seal: SEAL });
      pinchLastDistance = nextDistance;
      event.preventDefault();
      return;
    }
    if (gaze && gazeLast) {
      const dx = gaze.pageX - gazeLast.x, dy = gaze.pageY - gazeLast.y;
      if (Math.abs(dx) + Math.abs(dy) > 0) post(worker, 'cameraDrag', { dx: dx * 2.2, dy: dy * 1.4, seal: SEAL });
      gazeLast = { x: gaze.pageX, y: gaze.pageY };
    }
    if (joy || gaze) event.preventDefault();
  }, { passive: false, capture: true });
  const end = event => {
    for (const touch of touchList(event.changedTouches)) {
      if (touch.identifier === joystickId) { joystickId = null; joystickOrigin = null; releaseWalk(worker, active); }
      if (touch.identifier === gazeId) { gazeId = null; gazeLast = null; post(worker, 'mouseup', { button: 2, seal: SEAL }); }
      if (touch.identifier === pinchId) { pinchId = null; pinchLastDistance = 0; }
    }
  };
  window.addEventListener('touchend', end, { passive: false, capture: true });
  window.addEventListener('touchcancel', end, { passive: false, capture: true });
}

export default class TouchOrchestrator {
  static bind(worker) {
    const previous = window.__awtsmoosTouchOrchestratorBound;
    trace('bind-attempt', { previous, touchCapable: touchCapable(), maxTouchPoints: navigator.maxTouchPoints || 0, ua: navigator.userAgent });
    if (previous === SEAL) return trace('bind-same-seal-skip', { previous });
    window.__awtsmoosTouchOrchestratorBound = SEAL;
    const activeWalk = new Set();
    bindPointer(worker, activeWalk);
    bindTouch(worker, activeWalk);
    trace('bind-complete', { previous, seal: SEAL, pointer: 'onpointerdown' in window, touchCapable: touchCapable() });
  }
}
