// B"H
// Living sparks: little vessels moving through a world that remembers them.
import { describe } from "../state.js";
import { colorFor } from "./palette.js";
import { dist, groupByPath, hash } from "./math.js";
import { sparkShape } from "./shapes.js";

export function bodies(entries, w, h) { return entries.filter(e => !e.removed).slice(-280).map(e => body(e, w, h)); }
export function body(entry, w, h, fall = false) {
  const n = hash(entry.id);
  return { entry, c: colorFor(entry), x: fall ? w / 2 : (.1 + (n % 31) / 38) * w,
    y: fall ? -70 : (.34 + (n % 37) / 70) * h, tx: (.12 + (n % 29) / 36) * w,
    ty: (.38 + (n % 41) / 74) * h, a: n, r: 8 + (entry.intensity || 3) * 2,
    spin: ((n % 13) - 6) / 360 };
}
export function moveBodies(rows, pointer, t) {
  rows.forEach(s => {
    const pull = pointer ? Math.max(0, 1 - dist(s, pointer) / 330) : 0;
    s.x += (s.tx - s.x) * .032 + (pointer ? (s.x - pointer.x) * pull * .002 : 0);
    s.y += (s.ty - s.y) * .032 + Math.sin(t * 2 + s.a) * .22 + (pointer ? (s.y - pointer.y) * pull * .002 : 0);
  });
}
export function drawConstellations(ctx, rows) {
  ctx.save(); ctx.globalCompositeOperation = "screen";
  for (const group of groupByPath(rows).values()) if (group.length > 1) path(ctx, group);
  ctx.restore();
}
export function drawSpark(ctx, s, t) {
  const d = describe(s.entry), life = d.life[0], pulse = 1 + Math.sin(t * 3 + s.a) * .08;
  ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(t * s.spin); ctx.globalCompositeOperation = "screen";
  ctx.shadowBlur = 34; ctx.shadowColor = s.c; ctx.fillStyle = s.c; ctx.strokeStyle = "#ffffffd9"; ctx.lineWidth = 1.4;
  ctx.beginPath(); sparkShape(ctx, life, s.r * pulse); ctx.fill(); if (life !== "seed") ctx.stroke(); aura(ctx, s.r, s.c, pulse); ctx.restore();
}
export function drawReflections(ctx, rows, h) {
  ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = .24;
  rows.slice(-90).forEach(s => { ctx.fillStyle = s.c; ctx.beginPath(); ctx.ellipse(s.x, h * .75 + (h * .75 - s.y) * .13, s.r * 1.6, s.r * .35, 0, 0, 7); ctx.fill(); });
  ctx.restore();
}
function path(ctx, rows) { ctx.strokeStyle = rows[0].c + "76"; ctx.lineWidth = 1.6; ctx.beginPath(); rows.slice(0, 18).forEach((s, i) => i ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y)); ctx.stroke(); rows.slice(0, 18).forEach(s => { ctx.fillStyle = rows[0].c + "35"; ctx.beginPath(); ctx.arc(s.x, s.y, 30, 0, 7); ctx.fill(); }); }
function aura(ctx, r, c, p) { ctx.globalAlpha = .26; ctx.beginPath(); ctx.arc(0, 0, r * 2.9 * p, 0, 7); ctx.fillStyle = c; ctx.fill(); ctx.globalAlpha = .12; ctx.beginPath(); ctx.arc(0, 0, r * 4.8 * p, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
