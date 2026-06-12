/**
 * B"H
 * Mobile joystick: horizontal movement, upward jump, downward fast-fall.
 *
 * Chapter 86: the thumb circle stops pretending to be a full analog stick for
 * vertical movement. Left/right moves. Up jumps. Down fast-falls. Clear.
 */
export function touchJoystick(doc, state) {
  const stick = doc.getElementById('stick');
  const nub = stick?.querySelector('span');
  if (!stick || !nub) return;
  const center = () => stick.getBoundingClientRect();
  const move = event => {
    event.preventDefault();
    const r = center();
    const dx = clamp(event.clientX - r.left - r.width / 2, -42, 42);
    const dy = clamp(event.clientY - r.top - r.height / 2, -42, 42);
    state.x = Math.abs(dx) < 8 ? 0 : dx / 42;
    state.y = dy > 24 ? 1 : 0;
    state.down = dy > 24;
    state.jump = dy < -22;
    nub.style.transform = `translate(${dx}px,${dy}px)`;
  };
  const end = event => {
    event?.preventDefault?.();
    state.x = 0;
    state.y = 0;
    state.down = false;
    state.jump = false;
    nub.style.transform = 'translate(0,0)';
  };
  stick.addEventListener('pointerdown', event => { stick.setPointerCapture(event.pointerId); move(event); });
  stick.addEventListener('pointermove', move);
  stick.addEventListener('pointerup', end);
  stick.addEventListener('pointercancel', end);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
