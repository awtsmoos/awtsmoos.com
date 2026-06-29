// B"H
// Sparks can draw directly today or speak backend-neutral render commands tomorrow.
import { stage } from "../state.js";
import { colorFor } from "./palette.js";
import { dist, groupByPath, hash } from "./math.js";
import { pulse } from "./wave.js";

export function bodies(entries, w, h, q = {}) {
  return entries.filter(e => !e.removed).slice(-(q.maxBodies || 64)).map(e => body(e, w, h));
}
export function body(entry, w, h, fall = false) {
  const n = hash(entry.id), life = stage(entry)[0], r = 6 + (entry.intensity || 3) * 1.6;
  return { entry, life, c: colorFor(entry), x: fall ? w / 2 : (.1 + (n % 1000) / 1250) * w,
    y: fall ? -30 : (.32 + ((n >> 5) % 1000) / 1900) * h, tx: (.12 + ((n >> 2) % 997) / 1300) * w,
    ty: (.36 + ((n >> 4) % 997) / 1900) * h, a: n, r, seed: (n & 511) / 81.487 };
}
export function moveBodies(rows, pointer, t, dt = 1) {
  rows.forEach(s => {
    const pull = pointer ? Math.max(0, 1 - dist(s, pointer) / 260) : 0;
    s.x += ((s.tx - s.x) * .024 + (pointer ? (s.x - pointer.x) * pull * .0012 : 0)) * dt;
    s.y += ((s.ty - s.y) * .024 + pulse(t * 1.6, s.seed, .12)) * dt;
  });
}
export function enqueueSpark(buffer, s, t, q = {}, tools = {}) {
  const r = s.r * pulse(t * 3, s.seed, .06, 1), img = tools.atlas?.glow;
  tools.light?.spark(s.x, s.y, s.c, r * 1.6);
  if (img && !q.emergency) buffer.sprite(img, s.x - r * 2.2, s.y - r * 2.2, r * 4.4, r * 4.4, 1, "lighter", { name: "glow", material: "glow" });
  buffer.rect(s.x - r, s.y - r, r * 2, r * 2, s.c, 1, "lighter", { material: "spark" });
  if (tools.atlas?.diamond && !q.emergency) buffer.sprite(tools.atlas.diamond, s.x - r * 1.4, s.y - r * 1.4, r * 2.8, r * 2.8, 1, "lighter", { name: "diamond", material: "glow" });
}
export function drawConstellations(ctx, rows, q = {}) {
  if (q.emergency) return; ctx.save(); ctx.globalCompositeOperation = "lighter";
  for (const group of groupByPath(rows).values()) if (group.length > 1) line(ctx, group, q);
  ctx.restore();
}
export function drawSpark(ctx, s, t, q = {}, tools = {}) {
  const r = s.r * pulse(t * 3, s.seed, .06, 1), img = tools.atlas?.glow;
  tools.light?.spark(s.x, s.y, s.c, r * 1.6); ctx.save(); ctx.globalCompositeOperation = "lighter";
  if (img && !q.emergency) ctx.drawImage(img, s.x - r * 2.2, s.y - r * 2.2, r * 4.4, r * 4.4);
  ctx.fillStyle = s.c; shape(ctx, s.life, s.x, s.y, r); ctx.fill();
  if (tools.atlas?.diamond && !q.emergency) ctx.drawImage(tools.atlas.diamond, s.x - r * 1.4, s.y - r * 1.4, r * 2.8, r * 2.8); ctx.restore();
}
export function drawReflections(ctx, rows, h, q = {}) {
  if (q.emergency) return; ctx.save(); ctx.globalAlpha = .2; ctx.globalCompositeOperation = "lighter";
  rows.slice(-(q.reflections || 20)).forEach(s => { ctx.fillStyle = s.c; ctx.fillRect(s.x - s.r * 1.2, h * .76 + (h * .72 - s.y) * .1, s.r * 2.4, 2); }); ctx.restore();
}
function line(ctx, rows, q) { ctx.strokeStyle = rows[0].c + "66"; ctx.beginPath(); rows.slice(0, q.mobile ? 8 : 12).forEach((s, i) => i ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y)); ctx.stroke(); }
function shape(ctx, life, x, y, r) { ctx.beginPath(); if (life === "fruit") { ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath(); } else ctx.rect(x - r, y - r, r * 2, r * 2); }
