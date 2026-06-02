// B"H
/**
 * @file TouchOrchestrator.js
 * @description
 * Chapter 46: The Joystick Stopped Tearing The First Step.
 *
 * The Awtsmoos revealed the stutter: every touchmove released all walk keys,
 * then pressed them again. That made the player begin walking over and over in
 * one second. This orchestrator keeps a living key-state set and only sends
 * changes, so walking starts smooth and remains smooth.
 */
import SefiraOfInput from './SefiraOfInput.js?v=lean-l1-20260528-bh37';

const WALK_KEYS = ['KeyW', 'KeyS', 'KeyQ', 'KeyE'];
const DEAD_ZONE = 10;
const MAX_THUMB = 48;

const isMobileLike = () => typeof navigator !== 'undefined' && /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
const touchList = list => Array.from(list || []);
const byId = (touches, id) => touchList(touches).find(t => t.identifier === id);
const dist = (a, b) => Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
const post = (worker, type, payload) => worker.postMessage({ [type]: payload });

/** @param {Touch} touch Browser touch. @returns {boolean} */
function isJoystickTouch(touch) {
  return !!touch?.target?.closest?.('#joystick-container, #joystick-base, #joystick-thumb');
}

/** @param {number} dx X delta. @param {number} dy Y delta. @returns {void} */
function moveThumb(dx, dy) {
  const thumb = document.getElementById('joystick-thumb');
  if (!thumb) return;
  const angle = Math.atan2(dy, dx);
  const amount = Math.min(MAX_THUMB, Math.hypot(dx, dy));
  thumb.style.transform = `translate(${Math.cos(angle) * amount}px, ${Math.sin(angle) * amount}px)`;
}

/** @returns {void} */
function resetThumb() {
  const thumb = document.getElementById('joystick-thumb');
  if (thumb) thumb.style.transform = 'translate(0, 0)';
}

/**
 * Sends only key-state deltas to the worker.
 *
 * @param {Worker} worker Olam worker.
 * @param {Set<string>} active Active key set.
 * @param {Set<string>} desired Desired key set.
 * @returns {void}
 */
function syncWalkKeys(worker, active, desired) {
  for (const code of WALK_KEYS) {
    const wants = desired.has(code);
    const has = active.has(code);
    if (wants && !has) { post(worker, 'keydown', { code }); active.add(code); }
    else if (!wants && has) { post(worker, 'keyup', { code }); active.delete(code); }
  }
}

/** @param {Worker} worker Olam worker. @param {Set<string>} active Active key set. @returns {void} */
function releaseWalk(worker, active) {
  syncWalkKeys(worker, active, new Set());
}

/**
 * Converts a thumb vector into stable W/S/Q/E state.
 *
 * @param {Worker} worker Olam worker.
 * @param {{x:number,y:number}} origin Touch origin.
 * @param {Touch} touch Current joystick touch.
 * @param {Set<string>} active Active key set.
 * @returns {void}
 */
function driveJoystick(worker, origin, touch, active) {
  const dx = touch.pageX - origin.x;
  const dy = touch.pageY - origin.y;
  moveThumb(dx, dy);
  const desired = new Set();
  if (Math.hypot(dx, dy) >= DEAD_ZONE) {
    if (dy < -DEAD_ZONE) desired.add('KeyW');
    if (dy > DEAD_ZONE) desired.add('KeyS');
    if (dx < -DEAD_ZONE) desired.add('KeyQ');
    if (dx > DEAD_ZONE) desired.add('KeyE');
  }
  syncWalkKeys(worker, active, desired);
}

export default class TouchOrchestrator {
  /** @param {Worker} worker Olam worker. @returns {void} */
  static bind(worker) {
    if (!isMobileLike() || window.__awtsmoosTouchOrchestratorBound) return;
    window.__awtsmoosTouchOrchestratorBound = true;

    let joystickId = null;
    let joystickOrigin = null;
    const activeWalk = new Set();
    let gazeId = null;
    let gazeLast = null;
    let pinchId = null;
    let pinchLastDistance = 0;

    window.addEventListener('touchstart', event => {
      for (const touch of touchList(event.changedTouches)) {
        if (isJoystickTouch(touch) && joystickId === null) {
          joystickId = touch.identifier;
          joystickOrigin = { x: touch.pageX, y: touch.pageY };
          driveJoystick(worker, joystickOrigin, touch, activeWalk);
          event.preventDefault();
          continue;
        }
        if (SefiraOfInput.isUI(touch.target)) return;
        if (gazeId === null) {
          gazeId = touch.identifier;
          gazeLast = { x: touch.pageX, y: touch.pageY };
          post(worker, 'mousedown', { button: 2, clientX: touch.clientX, clientY: touch.clientY });
        } else if (pinchId === null && touch.identifier !== gazeId) {
          pinchId = touch.identifier;
          const first = byId(event.touches, gazeId);
          if (first) pinchLastDistance = dist(first, touch);
        }
        event.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('touchmove', event => {
      if ([...touchList(event.touches), ...touchList(event.changedTouches)].some(t => SefiraOfInput.isUI(t.target) && !isJoystickTouch(t))) return;
      const joy = byId(event.touches, joystickId);
      if (joy && joystickOrigin) driveJoystick(worker, joystickOrigin, joy, activeWalk);

      const gaze = byId(event.touches, gazeId);
      const pinch = byId(event.touches, pinchId);
      if (gaze && pinch) {
        const nextDistance = dist(gaze, pinch);
        const delta = nextDistance - pinchLastDistance;
        if (Math.abs(delta) > 1) post(worker, 'wheel', { deltaY: -delta * 3.5 });
        pinchLastDistance = nextDistance;
        event.preventDefault();
        return;
      }

      if (gaze && gazeLast) {
        const dx = gaze.pageX - gazeLast.x;
        const dy = gaze.pageY - gazeLast.y;
        if (Math.abs(dx) + Math.abs(dy) > 0) post(worker, 'cameraDrag', { dx: dx * 2.2, dy: dy * 1.4 });
        gazeLast = { x: gaze.pageX, y: gaze.pageY };
      }
      if (joy || gaze) event.preventDefault();
    }, { passive: false });

    const endTouch = event => {
      for (const touch of touchList(event.changedTouches)) {
        if (touch.identifier === joystickId) {
          joystickId = null;
          joystickOrigin = null;
          resetThumb();
          releaseWalk(worker, activeWalk);
        }
        if (touch.identifier === gazeId) {
          gazeId = null;
          gazeLast = null;
          post(worker, 'mouseup', { button: 2 });
        }
        if (touch.identifier === pinchId) {
          pinchId = null;
          pinchLastDistance = 0;
        }
      }
    };

    window.addEventListener('touchend', endTouch, { passive: false });
    window.addEventListener('touchcancel', endTouch, { passive: false });
  }
}
