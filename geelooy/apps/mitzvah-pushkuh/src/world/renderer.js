// B"H
// The renderer now uses cached heavens and only animates the living breath.
import { colorFor } from "./palette.js";
import { createEffects } from "./effects.js";
import { createLayers } from "./layers.js";
import { drawScene } from "./scene.js";
import { bodies, body, drawConstellations, drawReflections, drawSpark, moveBodies } from "./entities.js";
import { qualityFor } from "./quality.js";

export function createRenderer(canvas, opts = {}) {
  let ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  let cssW = 1, cssH = 1, w = 1, h = 1, t = 0, last = 0, paused = false, layers = null;
  let entries = [], sparks = [], pointer = null, q = qualityFor(1, 1, opts.reduced), effects = createEffects(q);
  function resize(width, height, dpr) {
    cssW = Math.max(1, width || cssW); cssH = Math.max(1, height || cssH);
    q = qualityFor(cssW, cssH, opts.reduced); q.dpr = dpr || q.dpr;
    w = Math.floor(cssW * q.dpr); h = Math.floor(cssH * q.dpr); canvas.width = w; canvas.height = h;
    layers = createLayers(w, h, q); effects = createEffects(q); setEntries(entries);
  }
  function setEntries(next = []) { entries = next; sparks = bodies(entries, w, h, q); }
  function plant(entry) { const s = body(entry, w, h, true); sparks.push(s); sparks = sparks.slice(-q.maxBodies); effects.shock(w / 2, h * .34, colorFor(entry), 2.4); }
  function bless(point, power = 1) { pointer = scalePoint(point); effects.trace(pointer); effects.burst(pointer.x, pointer.y, "#8feaff", .34 * power); }
  function strike(point) { bless(point, 2.15); if (pointer) effects.shock(pointer.x, pointer.y, "#ffe08a", 1.9); }
  function frame(now = performance.now()) {
    if (paused) return; const dt = Math.min(2, Math.max(.5, (now - last) / 16.67 || 1)); last = now; t += .016 * dt;
    drawScene(ctx, w, h, t, q, layers); moveBodies(sparks, pointer, t, dt); effects.move(dt);
    drawConstellations(ctx, sparks, q); sparks.forEach(s => drawSpark(ctx, s, t, q)); drawReflections(ctx, sparks, h, q); effects.draw(ctx); halo();
  }
  function halo() { if (!pointer) return; ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.strokeStyle = "rgba(143,234,255,.8)"; ctx.lineWidth = 2; ctx.shadowBlur = 22; ctx.shadowColor = "#8feaff"; ctx.beginPath(); ctx.arc(pointer.x, pointer.y, 36 + Math.sin(t * 8) * 5, 0, 7); ctx.stroke(); ctx.restore(); }
  function scalePoint(point) { return { x: point.x * q.dpr, y: point.y * q.dpr }; }
  function setPaused(value) { paused = value; }
  return { resize, setEntries, plant, bless, strike, frame, setPaused };
}
