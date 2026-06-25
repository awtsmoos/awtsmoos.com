// B"H
// The facade chooses the hidden worker and binds touch into ritual.
import { attachWorldInput } from "./input.js";
import { createMainThreadWorld } from "./main-thread.js";
import { canUseWorker, createWorkerWorld } from "./worker-host.js";

export function createWorld(canvas) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const debug = new URLSearchParams(location.search).has("worldDebug");
  const world = canUseWorker(canvas) && !reduced ? createWorkerWorld(canvas, reduced, debug) : createMainThreadWorld(canvas, reduced, debug);
  const detach = attachWorldInput(canvas, world);
  return { ...world, destroy: () => { detach?.(); world.destroy?.(); } };
}
