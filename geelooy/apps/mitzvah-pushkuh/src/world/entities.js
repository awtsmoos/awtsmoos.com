// B"H
// Sparks are vivid now, but their geometry is still light enough to fly.
import { describe } from "../state.js";
import { colorFor } from "./palette.js";
import { dist, groupByPath, hash } from "./math.js";
import { sparkShape } from "./shapes.js";

export function bodies(entries, w, h, q = {}) {
  return entries.filter(e => !e.removed).slice(-(q.maxBodies || 240)).map(e => body(e, w, h));
}
export function body(entry, w, h, fall = false) {
  const n = hash(entry.id), lane = (n % 1000) / 1000;
  return { entry, c: colorFor(entry), x: fall ? w / 2 : (.08 + lane * .84) * w,
    y: fall ? -70 : (.3 + ((n >> 4) % 1000) / 1700) * h, tx: (.1 + ((n >> 2) % 997) / 1240) * w,
    ty: (.34 + ((n >> 5) % 997) / 1800) * h, a: n, r: 8 + (entry.intensity || 3) * 2,
    spin: ((n % 13) - 6) / 360 };
}
export function moveBodies(rows, pointer, t, dt = 1) {
  rows.forEach(s => {
    const pull = pointer ? Math.max(0, 1 - dist(s, pointer) / 320) : 0;
    s.x += ((s.tx - s.x) * .028 + (pointer ? (s.x - pointer.x) * pull * .0018 : 0)) * dt;
    s.y += ((s.ty - s.y) * .028 + Math.sin(t * 2 + s.a) * .2 + (pointer ? (s.y - pointer.y) * pull * .0018 : 0)) * dt;
  });
}
export function drawConstellations(ctx, rows, q = {}) {
  ctx.save(); ctx.globalCompositeOperation = "screen";
  for (const group of groupByPath(rows).values()) if (group.length > 1) path(ctx, group, q);
  ctx.restore();
}
export function drawSpark(ctx, s, t, q = {}) {
  const d = describe(s.entry), life = d.life[0], pulse = 1 + Math.sin(t * 3 + s.a) * .08;
  ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(t * s.spin); ctx.globalCompositeOperation = "screen";
  aura(ctx, s.r, s.c, pulse, q); ctx.shadowBlur = q.mobile ? 14 : 21; ctx.shadowColor = s.c; ctx.fillStyle = s.c; ctx.strokeStyle = "#ffffffe8"; ctx.lineWidth = 1.35;
  ctx.beginPath(); sparkShape(ctx, life, s.r * pulse); ctx.fill(); if (life !== "seed") ctx.stroke(); diamond(ctx, s.r * pulse); ctx.restore();
}
export function drawReflections(ctx, rows, h, q = {}) {
  ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = .2;
  rows.slice(-(q.reflections || 80)).forEach(s => { ctx.fillStyle = s.c; ctx.beginPath(); ctx.ellipse(s.x, h * .75 + (h * .75 - s.y) * .13, s.r * 1.35, s.r * .28, 0, 0, 7); ctx.fill(); });
  ctx.restore();
}
function path(ctx, rows, q) { ctx.strokeStyle = rows[0].c + "72"; ctx.lineWidth = q.mobile ? 1 : 1.5; ctx.beginPath(); rows.slice(0, q.mobile ? 12 : 18).forEach((s, i) => i ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y)); ctx.stroke(); }
function aura(ctx, r, c, p, q) { ctx.globalAlpha = .2; ctx.beginPath(); ctx.arc(0, 0, r * (q.mobile ? 2.2 : 2.9) * p, 0, 7); ctx.fillStyle = c; ctx.fill(); ctx.globalAlpha = .09; ctx.beginPath(); ctx.arc(0, 0, r * (q.mobile ? 3.4 : 4.8) * p, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
function diamond(ctx, r) { ctx.globalAlpha = .38; ctx.strokeStyle = "#fff"; ctx.beginPath(); ctx.moveTo(0, -r * 1.8); ctx.lineTo(r * 1.8, 0); ctx.lineTo(0, r * 1.8); ctx.lineTo(-r * 1.8, 0); ctx.closePath(); ctx.stroke(); ctx.globalAlpha = 1; }
