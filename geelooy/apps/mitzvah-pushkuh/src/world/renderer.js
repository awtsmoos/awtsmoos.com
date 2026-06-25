// B"H
// Lightning renderer: cached heavens, atlas fire, tiny light buffer, adaptive mercy.
import { colorFor } from "./palette.js";
import { createAtlas } from "./atlas.js";
import { createEffects } from "./effects.js";
import { createLayers } from "./layers.js";
import { createLightBuffer } from "./light-buffer.js";
import { drawScene } from "./scene.js";
import { bodies, body, drawConstellations, drawReflections, drawSpark, moveBodies } from "./entities.js";
import { emergencyQuality, qualityFor } from "./quality.js";

export function createRenderer(canvas, opts = {}) {
  let ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  let w = 1, h = 1, t = 0, last = 0, bad = 0, paused = false, layers = null, tools = {};
  let baseQ = qualityFor(1, 1, opts.reduced), q = baseQ, entries = [], sparks = [], pointer = null, effects = createEffects(q);
  function resize(width, height, dpr) {
    baseQ = qualityFor(Math.max(1, width), Math.max(1, height), opts.reduced); baseQ.dpr = Math.min(baseQ.dpr, dpr || baseQ.dpr); q = baseQ;
    w = Math.floor(width * q.dpr); h = Math.floor(height * q.dpr); canvas.width = w; canvas.height = h;
    layers = createLayers(w, h, q); tools = { atlas: createAtlas(), light: createLightBuffer(w, h) }; effects = createEffects(q); setEntries(entries);
  }
  function setEntries(next = []) { entries = next; sparks = bodies(entries, w, h, q); }
  function plant(entry) { const s = body(entry, w, h, true); sparks.push(s); sparks = sparks.slice(-q.maxBodies); effects.shock(w / 2, h * .34, colorFor(entry), q.emergency ? .6 : 1.4); }
  function bless(point, power = 1) { pointer = scalePoint(point); if (!q.emergency) { effects.trace(pointer); effects.burst(pointer.x, pointer.y, "#8feaff", .22 * power); } }
  function strike(point) { bless(point, 1); if (!q.emergency && pointer) effects.shock(pointer.x, pointer.y, "#ffe08a", 1); }
  function frame(now = performance.now()) {
    if (paused) return; const delta = now - last || 16.67; last = now; adapt(delta); const dt = Math.min(1.5, Math.max(.75, delta / 16.67)); t += .016 * dt;
    tools.light?.clear(); drawScene(ctx, w, h, t, q, layers, tools); moveBodies(sparks, pointer, t, dt); effects.move(dt);
    drawConstellations(ctx, sparks, q); for (let i = 0; i < sparks.length; i++) drawSpark(ctx, sparks[i], t, q, tools);
    drawReflections(ctx, sparks, h, q); effects.draw(ctx, tools); tools.light?.flush(ctx, w, h);
  }
  function adapt(delta) { bad = delta > 19 ? bad + 1 : Math.max(0, bad - 1); if (bad > 24 && !q.emergency) { q = emergencyQuality(baseQ); effects = createEffects(q); setEntries(entries); } }
  function scalePoint(point) { return { x: point.x * q.dpr, y: point.y * q.dpr }; }
  function setPaused(value) { paused = value; }
  return { resize, setEntries, plant, bless, strike, frame, setPaused };
}
