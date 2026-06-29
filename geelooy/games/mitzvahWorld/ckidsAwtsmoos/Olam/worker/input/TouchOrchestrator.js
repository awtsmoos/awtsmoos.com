// B"H
/**
 * @file TouchOrchestrator.js
 * @description Chapter 430: mobile joystick speaks the switched E/Q covenant.
 */
import SefiraOfInput from './SefiraOfInput.js?v=npc-scroll-pass-through-20260609-bh638';

const SEAL = 'natural-tap-joystick-20260629-bh1';
const WALK = ['KeyW', 'KeyS', 'KeyQ', 'KeyE'];
const MOBILE_RE = /Mobile|Android|iPhone|iPad|iPod/i;

const list = x => Array.from(x || []);
const by = (touches, id) => list(touches).find(t => t.identifier === id);
const dist = (a, b) => Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
const post = (worker, type, payload) => worker?.postMessage?.({ [type]: payload });

function touchCapable() {
  return typeof window !== 'undefined' && (
    'ontouchstart' in window || navigator.maxTouchPoints > 0 || MOBILE_RE.test(navigator.userAgent || '')
  );
}

function settings() {
  const fallback = { invertY: false, invertX: false, deadzone: 10, camera: 1, naturalJoystick: true };
  try {
    const stored = JSON.parse(localStorage.getItem('awtsmoosMobileSettings') || '{}');
    if (stored.naturalJoystick !== true) return { ...stored, invertY: false, invertX: false, naturalJoystick: true, deadzone: stored.deadzone || fallback.deadzone, camera: stored.camera || fallback.camera };
    return { ...fallback, ...stored };
  }
  catch { return fallback; }
}

function trace(stage, payload = {}) {
  window.__AWTSMOOS_TOUCH_TRACE__ ||= [];
  window.__AWTSMOOS_TOUCH_TRACE__.push({ at: Date.now(), seal: SEAL, stage, ...payload });
  window.__AWTSMOOS_TOUCH_TRACE__ = window.__AWTSMOOS_TOUCH_TRACE__.slice(-120);
  if (!payload.quiet && window.__AWTSMOOS_INPUT_TRACE__ === true) {
    console.info('B"H | TOUCH_ORCHESTRATOR_TRACE', { seal: SEAL, stage, ...payload });
  }
}

function isJoy(target) { return !!target?.closest?.('#joystick-container,#joystick-base,#joystick-thumb'); }
function isUi(target) { return SefiraOfInput.isUI(target) && !isJoy(target); }

function thumb(dx, dy) {
  const el = document.getElementById('joystick-thumb');
  if (!el) return;
  const angle = Math.atan2(dy, dx);
  const mag = Math.min(48, Math.hypot(dx, dy));
  el.style.transform = `translate(${Math.cos(angle) * mag}px, ${Math.sin(angle) * mag}px)`;
}

function resetThumb() {
  const el = document.getElementById('joystick-thumb');
  if (el) el.style.transform = 'translate(0,0)';
}

function desired(dx, dy) {
  const s = settings();
  const dz = Number(s.deadzone) || 10;
  const out = new Set();
  if (Math.hypot(dx, dy) < dz) return out;
  const up = s.invertY ? 'KeyS' : 'KeyW';
  const down = s.invertY ? 'KeyW' : 'KeyS';
  const left = s.invertX ? 'KeyE' : 'KeyQ';
  const right = s.invertX ? 'KeyQ' : 'KeyE';
  if (dy < -dz) out.add(up);
  if (dy > dz) out.add(down);
  if (dx < -dz) out.add(left);
  if (dx > dz) out.add(right);
  return out;
}

function state(down) {
  return {
    FORWARD: down.has('KeyW'),
    BACKWARD: down.has('KeyS'),
    LEFT_STRIDE: down.has('KeyE'),
    RIGHT_STRIDE: down.has('KeyQ'),
    source: 'android-settings-joystick', seal: SEAL, settings: settings(), at: Date.now()
  };
}

function sync(worker, active, desiredSet) {
  for (const code of WALK) {
    const wants = desiredSet.has(code), has = active.has(code);
    if (wants && !has) { post(worker, 'keydown', { code, seal: SEAL }); active.add(code); }
    else if (!wants && has) { post(worker, 'keyup', { code, seal: SEAL }); active.delete(code); }
  }
  post(worker, 'mobileMove', state(desiredSet));
}

function release(worker, active) { sync(worker, active, new Set()); resetThumb(); trace('joystick-release'); }
function drive(worker, origin, point, active, label) {
  const dx = point.pageX - origin.x, dy = point.pageY - origin.y;
  thumb(dx, dy); const d = desired(dx, dy); sync(worker, active, d);
  trace('joystick-drive', { label, desired: [...d], dx: Math.round(dx), dy: Math.round(dy), quiet: true });
}

function bindPointer(worker, active) {
  let id = null, origin = null;
  window.addEventListener('pointerdown', e => {
    if (!isJoy(e.target) || id !== null) return;
    id = e.pointerId; origin = { x: e.pageX, y: e.pageY };
    e.target?.setPointerCapture?.(id); drive(worker, origin, e, active, 'pointer');
    trace('pointer-start', { id }); e.preventDefault(); e.stopPropagation();
  }, { passive: false, capture: true });
  window.addEventListener('pointermove', e => {
    if (e.pointerId !== id || !origin) return;
    drive(worker, origin, e, active, 'pointer'); e.preventDefault(); e.stopPropagation();
  }, { passive: false, capture: true });
  const end = e => { if (e.pointerId !== id) return; id = null; origin = null; release(worker, active); e.preventDefault(); e.stopPropagation(); };
  window.addEventListener('pointerup', end, { passive: false, capture: true });
  window.addEventListener('pointercancel', end, { passive: false, capture: true });
}

function bindTouch(worker, active) {
  let jid = null, jo = null, gid = null, gl = null, pid = null, pl = 0, gm = false;
  window.addEventListener('touchstart', e => {
    for (const t of list(e.changedTouches)) {
      if (isJoy(t.target) && jid === null) { jid = t.identifier; jo = { x: t.pageX, y: t.pageY }; drive(worker, jo, t, active, 'touch'); e.preventDefault(); e.stopPropagation(); continue; }
      if (isUi(t.target)) continue;
      if (gid === null) { gid = t.identifier; gl = { x: t.pageX, y: t.pageY }; gm = false; post(worker, 'touchstart', { button: 0, clientX: t.clientX, clientY: t.clientY, pointerType:'touch', isTouch:true, seal: SEAL }); }
      else if (pid === null && t.identifier !== gid) { pid = t.identifier; const first = by(e.touches, gid); if (first) pl = dist(first, t); }
      e.preventDefault();
    }
  }, { passive: false, capture: true });
  window.addEventListener('touchmove', e => {
    const joy = by(e.touches, jid); if (joy && jo) drive(worker, jo, joy, active, 'touch');
    const gaze = by(e.touches, gid), pinch = by(e.touches, pid), cam = Number(settings().camera) || 1;
    if (gaze && pinch) { const nd = dist(gaze, pinch), delta = nd - pl; if (Math.abs(delta) > 1) post(worker, 'wheel', { deltaY: -delta * 3.5, seal: SEAL }); pl = nd; e.preventDefault(); return; }
    if (gaze && gl) { const dx = gaze.pageX - gl.x, dy = gaze.pageY - gl.y; if (Math.abs(dx) + Math.abs(dy) > 6) { gm = true; post(worker, 'cameraDrag', { dx: dx * 2.2 * cam, dy: dy * 1.4 * cam, seal: SEAL }); } gl = { x: gaze.pageX, y: gaze.pageY }; }
    if (joy || gaze) e.preventDefault();
  }, { passive: false, capture: true });
  const end = e => { for (const t of list(e.changedTouches)) { if (t.identifier === jid) { jid = null; jo = null; release(worker, active); } if (t.identifier === gid) { if (!gm) post(worker, 'pointerdown', { button: 0, clientX: t.clientX, clientY: t.clientY, pointerType:'touch', isTouch:true, seal: SEAL }); gid = null; gl = null; gm = false; } if (t.identifier === pid) { pid = null; pl = 0; } } };
  window.addEventListener('touchend', end, { passive: false, capture: true });
  window.addEventListener('touchcancel', end, { passive: false, capture: true });
}

export default class TouchOrchestrator {
  static bind(worker) {
    const prev = window.__awtsmoosTouchOrchestratorBound;
    trace('bind-attempt', { prev, touchCapable: touchCapable(), settings: settings() });
    if (prev === SEAL) return;
    window.__awtsmoosTouchOrchestratorBound = SEAL;
    const active = new Set(); bindPointer(worker, active); bindTouch(worker, active);
    trace('bind-complete', { seal: SEAL, settings: settings() });
  }
}
