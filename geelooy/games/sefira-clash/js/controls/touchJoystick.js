/**
 * B"H
 * Mobile joystick with exact analog aim.
 *
 * Chapter 276: the thumb is no longer crushed into only up, down, or side.
 * Movement still reads clean left/right, but combat receives the true circular
 * vector, so a punch or kick can travel along the exact angle the player holds.
 */
export function touchJoystick(doc, state) {
  const stick = doc.getElementById('stick');
  const nub = stick?.querySelector('span');
  if (!stick || !nub) return;
  const center = () => stick.getBoundingClientRect();
  const move = event => {
    event.preventDefault();
    const r = center();
    const rawX = event.clientX - r.left - r.width / 2;
    const rawY = event.clientY - r.top - r.height / 2;
    const clamped = clampCircle(rawX, rawY, 42);
    const mag = Math.hypot(clamped.x, clamped.y) / 42;
    state.x = Math.abs(clamped.x) < 8 ? 0 : clamped.x / 42;
    state.y = Math.abs(clamped.y) < 8 ? 0 : clamped.y / 42;
    state.aimX = mag < 0.18 ? 0 : clamped.x / 42;
    state.aimY = mag < 0.18 ? 0 : clamped.y / 42;
    state.down = clamped.y > 20;
    state.jump = clamped.y < -22;
    nub.style.transform = `translate(${clamped.x}px,${clamped.y}px)`;
  };
  const end = event => {
    event?.preventDefault?.();
    state.x = 0;
    state.y = 0;
    state.aimX = 0;
    state.aimY = 0;
    state.down = false;
    state.jump = false;
    nub.style.transform = 'translate(0,0)';
  };
  stick.addEventListener('pointerdown', event => { stick.setPointerCapture(event.pointerId); move(event); });
  stick.addEventListener('pointermove', move);
  stick.addEventListener('pointerup', end);
  stick.addEventListener('pointercancel', end);
}

function clampCircle(x, y, radius) {
  const len = Math.hypot(x, y);
  if (len <= radius) return { x, y };
  const scale = radius / len;
  return { x: x * scale, y: y * scale };
}
