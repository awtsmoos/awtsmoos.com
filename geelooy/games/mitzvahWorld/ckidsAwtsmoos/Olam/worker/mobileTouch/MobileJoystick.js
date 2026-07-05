// B"H
/** The joystick releases all directions, then breathes one clear direction. */
import { JOYSTICK_KEYS } from "./MobileTouchConstants.js";
export function steer(dx, dy, callback) {
  let angle = Math.atan2(dy, dx) * 180 / Math.PI;
  if (angle < 0) angle += 360;
  Object.values(JOYSTICK_KEYS).forEach(code => callback("keyup", { code, source:"mobile-joystick" }));
  emitDirection(angle, callback);
  moveThumb(dx, dy);
}
function emitDirection(angle, cb) {
  const k = JOYSTICK_KEYS;
  if (angle >= 337.5 || angle < 22.5) cb("keydown", { code:k.right });
  else if (angle < 67.5) diagonal(cb, k.right, k.down);
  else if (angle < 112.5) cb("keydown", { code:k.down });
  else if (angle < 157.5) diagonal(cb, k.left, k.down);
  else if (angle < 202.5) cb("keydown", { code:k.left });
  else if (angle < 247.5) diagonal(cb, k.left, k.up);
  else if (angle < 292.5) cb("keydown", { code:k.up });
  else diagonal(cb, k.up, k.right);
}
function diagonal(cb, a, b) { cb("keydown", { code:a }); cb("keydown", { code:b }); }
function moveThumb(dx, dy) {
  const thumb = document.getElementById("joystick-thumb"), max = 60;
  const mag = Math.min(max, Math.hypot(dx, dy)), a = Math.atan2(dy, dx);
  if (thumb) { thumb.style.left = `${mag * Math.cos(a) + 45}px`; thumb.style.top = `${mag * Math.sin(a) + 45}px`; }
}
export function resetJoystick() { const thumb = document.getElementById("joystick-thumb"); if (thumb) { thumb.style.left = ""; thumb.style.top = ""; } }
export function releaseJoystick(callback) { Object.values(JOYSTICK_KEYS).forEach(code => callback("keyup", { code, source:"mobile-joystick-end" })); }
