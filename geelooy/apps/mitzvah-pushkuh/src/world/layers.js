// B"H
// A cached firmament: paint the heavens once, then let only breath move.
import { round } from "./shapes.js";

export function createLayers(w, h, q) {
  const bg = make(w, h), glow = make(w, h);
  paintBackground(bg.getContext("2d"), w, h, q);
  paintGlow(glow.getContext("2d"), w, h);
  return { bg, glow };
}
function make(w, h) {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(w, h);
  const c = document.createElement("canvas"); c.width = w; c.height = h; return c;
}
function paintBackground(ctx, w, h, q) {
  sky(ctx, w, h); stars(ctx, w, h, q.stars || 180); mountains(ctx, w, h); lakeBase(ctx, w, h); islands(ctx, w, h); vessel(ctx, w, h);
}
function sky(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#020009"); g.addColorStop(.22, "#180735"); g.addColorStop(.55, "#05243d"); g.addColorStop(1, "#020006");
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}
function stars(ctx, w, h, n) {
  ctx.save(); ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < n; i++) { const x = (i * 97) % w, y = (i * 53) % (h * .72), r = .8 + (i % 5) * .28; ctx.fillStyle = `rgba(255,255,255,${.07 + (i % 11) / 55})`; ctx.fillRect(x, y, r, r); }
  ctx.restore();
}
function mountains(ctx, w, h) { ridge(ctx, w, h, .46, "#18113fcc", .04, 6); ridge(ctx, w, h, .55, "#08223ee8", .06, 9); ridge(ctx, w, h, .64, "#030815f5", .09, 13); }
function ridge(ctx, w, h, base, fill, amp, seed) { ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w; x += w / 13) ctx.lineTo(x, h * base + Math.sin(x / 170 + seed) * h * amp - ((x / w - .5) ** 2) * h * .08); ctx.lineTo(w, h); ctx.fill(); }
function lakeBase(ctx, w, h) { const y = h * .66, g = ctx.createLinearGradient(0, y, 0, h); g.addColorStop(0, "#8feaff35"); g.addColorStop(.44, "#ffe08a16"); g.addColorStop(1, "#030108dd"); ctx.fillStyle = g; ctx.fillRect(0, y, w, h - y); }
function islands(ctx, w, h) { for (let i = 0; i < 8; i++) { const x = w * (.08 + i * .125), y = h * (.25 + (i % 4) * .038); ctx.fillStyle = "rgba(255,255,255,.12)"; round(ctx, x - 42, y - 10, 84, 22, 18); ctx.fill(); ctx.fillStyle = "rgba(255,224,138,.72)"; ctx.fillRect(x - 2, y - 42, 4, 32); ctx.beginPath(); ctx.arc(x, y - 50, 9, 0, 7); ctx.fill(); } }
function vessel(ctx, w, h) { const x = w * .05, y = h * .12, W = w * .9, H = h * .78; ctx.save(); ctx.shadowBlur = 44; ctx.shadowColor = "#ffe08a99"; ctx.fillStyle = "rgba(255,255,255,.066)"; ctx.strokeStyle = "rgba(255,236,168,.78)"; ctx.lineWidth = 4; round(ctx, x, y, W, H, 68); ctx.fill(); ctx.stroke(); ctx.restore(); }
function paintGlow(ctx, w, h) { const g = ctx.createRadialGradient(w * .5, h * .42, 1, w * .5, h * .42, Math.max(w, h) * .55); g.addColorStop(0, "rgba(255,224,138,.18)"); g.addColorStop(.34, "rgba(143,234,255,.11)"); g.addColorStop(1, "rgba(255,135,215,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); }
