// B"H
/**
 * @file TouchOrchestrator.js
 * @description
 * Chapter 16: The thumb walks; the empty sky turns.
 *
 * The Awtsmoos separates two kinds of touch. A thumb on the joystick is not a
 * neck, so it does not rotate the Chossid. It sends W/S for forward/back and
 * Q/E for left/right stride. A finger dragged across open world-space rotates
 * the camera/player gaze like right-mouse desktop control. Two fingers pinch
 * the distance of the eye.
 */
import SefiraOfInput from './SefiraOfInput.js';

const WALK_KEYS = ['KeyW', 'KeyS', 'KeyQ', 'KeyE'];
const DEAD_ZONE = 10;
const MAX_THUMB = 48;

const isMobileLike = () => {
  if (typeof navigator === 'undefined') return false;
  return /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
};

const touchList = list => Array.from(list || []);
const byId = (touches, id) => touchList(touches).find(t => t.identifier === id);
const dist = (a, b) => Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
const post = (worker, type, payload) => worker.postMessage({ [type]: payload });
const releaseWalk = worker => WALK_KEYS.forEach(code => post(worker, 'keyup', { code }));

const moveThumb = (dx, dy) => {
  const thumb = document.getElementById('joystick-thumb');
  if (!thumb) return;
  const angle = Math.atan2(dy, dx);
  const amount = Math.min(MAX_THUMB, Math.hypot(dx, dy));
  thumb.style.transform = `translate(${Math.cos(angle) * amount}px, ${Math.sin(angle) * amount}px)`;
};

const resetThumb = () => {
  const thumb = document.getElementById('joystick-thumb');
  if (thumb) thumb.style.transform = 'translate(0, 0)';
};

function driveJoystick(worker, origin, touch) {
  const dx = touch.pageX - origin.x;
  const dy = touch.pageY - origin.y;
  moveThumb(dx, dy);
  releaseWalk(worker);
  if (Math.hypot(dx, dy) < DEAD_ZONE) return;
  if (dy < -DEAD_ZONE) post(worker, 'keydown', { code: 'KeyW' });
  if (dy > DEAD_ZONE) post(worker, 'keydown', { code: 'KeyS' });
  if (dx < -DEAD_ZONE) post(worker, 'keydown', { code: 'KeyQ' });
  if (dx > DEAD_ZONE) post(worker, 'keydown', { code: 'KeyE' });
}

function isJoystickTouch(touch) {
  return !!touch?.target?.closest?.('#joystick-container, #joystick-base');
}

export default class TouchOrchestrator {
  static bind(worker) {
    if (!isMobileLike() || window.__awtsmoosTouchOrchestratorBound) return;
    window.__awtsmoosTouchOrchestratorBound = true;

    let joystickId = null;
    let joystickOrigin = null;
    let gazeId = null;
    let gazeLast = null;
    let pinchId = null;
    let pinchLastDistance = 0;

    window.addEventListener('touchstart', event => {
      for (const touch of touchList(event.changedTouches)) {
        if (isJoystickTouch(touch) && joystickId === null) {
          joystickId = touch.identifier;
          joystickOrigin = { x: touch.pageX, y: touch.pageY };
          driveJoystick(worker, joystickOrigin, touch);
          event.preventDefault();
          continue;
        }
        if (SefiraOfInput.isUI(touch.target)) continue;
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
      const joy = byId(event.touches, joystickId);
      if (joy && joystickOrigin) driveJoystick(worker, joystickOrigin, joy);

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
          releaseWalk(worker);
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
