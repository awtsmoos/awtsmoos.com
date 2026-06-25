// B"H
// Input coordinator: pointer, gesture, haptics, sensors, and audio become one ritual.
import { createAudioEngine } from "./input/audio.js";
import { centroid, isSwipe } from "./input/gestures.js";
import { vibrate } from "./input/haptics.js";
import { pointFrom } from "./input/pointer.js";
import { tiltPoint } from "./input/sensors.js";

export function attachWorldInput(canvas, world) {
  const active = new Map(), audio = createAudioEngine(); let lastMove = 0, lastTilt = 0;
  function blessPoint(p, power = .7) { world.bless(p.x, p.y, power); audio.pulse(power); }
  function strikePoint(p) { audio.unlock(); vibrate([8, 18, 12]); world.strike(p.x, p.y); audio.pulse(2); }
  function down(e) { const p = pointFrom(e); canvas.setPointerCapture?.(e.pointerId); active.set(e.pointerId, p); strikePoint(p); multi(); }
  function move(e) {
    const now = performance.now(), p = pointFrom(e), prev = active.get(e.pointerId); active.set(e.pointerId, p);
    if (now - lastMove > 42) { lastMove = now; blessPoint(p, .75); }
    if (isSwipe(prev, p)) { vibrate(5); blessPoint(p, 1.4); }
  }
  function up(e) { active.delete(e.pointerId); }
  function multi() { const c = active.size > 1 ? centroid(active.values()) : null; if (c) { world.strike(c.x, c.y); audio.pulse(2.5); vibrate([5, 10, 5]); } }
  function tilt(e) { const now = performance.now(); if (now - lastTilt < 220 || active.size) return; lastTilt = now; blessPoint(tiltPoint(e), .34); }
  canvas.addEventListener("pointerdown", down, { passive: true }); canvas.addEventListener("pointermove", move, { passive: true });
  canvas.addEventListener("pointerup", up, { passive: true }); canvas.addEventListener("pointercancel", up, { passive: true }); addEventListener("deviceorientation", tilt, { passive: true });
  return () => removeEventListener("deviceorientation", tilt);
}
