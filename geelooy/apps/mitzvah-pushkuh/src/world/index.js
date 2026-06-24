// B"H
// The world orchestrator: many small vessels, one living canvas.
import { colorFor } from "./palette.js";
import { canvasPoint } from "./math.js";
import { createEffects } from "./effects.js";
import { drawScene } from "./scene.js";
import { bodies, body, drawConstellations, drawReflections, drawSpark, moveBodies } from "./entities.js";

export function createWorld(canvas) {
  const ctx = canvas.getContext("2d"), effects = createEffects();
  let w = 1, h = 1, t = 0, sparks = [], pointer = null;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function resize() {
    const r = canvas.getBoundingClientRect(), d = devicePixelRatio || 1;
    w = canvas.width = Math.max(1, r.width * d);
    h = canvas.height = Math.max(1, r.height * d);
  }
  function setEntries(entries) { sparks = bodies(entries, w, h); }
  function plant(entry) { const s = body(entry, w, h, true); sparks.push(s); effects.shock(w / 2, h * .34, colorFor(entry), 2.7); }
  function bless(x, y, power = 1) { pointer = canvasPoint(canvas, x, y); effects.trace(pointer); effects.burst(pointer.x, pointer.y, "#8feaff", .55 * power); }
  function strike(x, y) { bless(x, y, 2.4); if (pointer) effects.shock(pointer.x, pointer.y, "#ffe08a", 2); }
  function draw() {
    t += .016; drawScene(ctx, w, h, t); moveBodies(sparks, pointer, t); effects.move();
    drawConstellations(ctx, sparks); sparks.forEach(s => drawSpark(ctx, s, t)); drawReflections(ctx, sparks, h); effects.draw(ctx); halo();
    if (!reduced) requestAnimationFrame(draw);
  }
  function halo() {
    if (!pointer) return; ctx.save(); ctx.strokeStyle = "rgba(143,234,255,.78)"; ctx.lineWidth = 2; ctx.shadowBlur = 32; ctx.shadowColor = "#8feaff";
    ctx.beginPath(); ctx.arc(pointer.x, pointer.y, 43 + Math.sin(t * 8) * 6, 0, 7); ctx.stroke(); ctx.restore();
  }
  addEventListener("resize", resize);
  canvas.addEventListener("pointermove", e => bless(e.clientX, e.clientY, .7), { passive: true });
  canvas.addEventListener("pointerdown", e => strike(e.clientX, e.clientY));
  resize(); draw();
  return { setEntries, plant, bless, strike };
}
