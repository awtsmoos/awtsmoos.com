// B"H
// The facade chooses the hidden worker, or a gentle fallback, without changing the app.
import { createMainThreadWorld } from "./main-thread.js";
import { canUseWorker, createWorkerWorld } from "./worker-host.js";

export function createWorld(canvas) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const world = canUseWorker(canvas) && !reduced ? createWorkerWorld(canvas, reduced) : createMainThreadWorld(canvas, reduced);
  canvas.addEventListener("pointermove", e => world.bless(e.clientX, e.clientY, .7), { passive: true });
  canvas.addEventListener("pointerdown", e => world.strike(e.clientX, e.clientY), { passive: true });
  return world;
}
