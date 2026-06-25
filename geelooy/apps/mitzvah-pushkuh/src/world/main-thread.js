// B"H
// Fallback vessel: when no worker exists, we still breathe carefully.
import { createRenderer } from "./renderer.js";
import { qualityFor } from "./quality.js";

export function createMainThreadWorld(canvas, reduced) {
  const renderer = createRenderer(canvas, { reduced });
  let raf = 0, rect = canvas.getBoundingClientRect(), q = qualityFor(rect.width, rect.height, reduced);
  function resize() {
    rect = canvas.getBoundingClientRect(); q = qualityFor(rect.width, rect.height, reduced);
    renderer.resize(rect.width, rect.height, q.dpr);
  }
  function loop(now) { renderer.frame(now); if (!reduced) raf = requestAnimationFrame(loop); }
  function point(x, y) { return { x: x - rect.left, y: y - rect.top }; }
  const ro = new ResizeObserver(resize); ro.observe(canvas); resize(); loop(performance.now());
  document.addEventListener("visibilitychange", () => renderer.setPaused(document.hidden));
  addEventListener("resize", resize);
  return {
    setEntries: renderer.setEntries, plant: renderer.plant,
    bless: (x, y, p) => renderer.bless(point(x, y), p),
    strike: (x, y) => renderer.strike(point(x, y)),
    destroy: () => { cancelAnimationFrame(raf); ro.disconnect(); }
  };
}
