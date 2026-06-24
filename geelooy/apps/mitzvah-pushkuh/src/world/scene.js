// B"H
// This is the backdrop of return: sky, water, roots, and hidden islands.
import { round } from "./shapes.js";

export function drawScene(ctx, w, h, t) {
  sky(ctx, w, h, t); sun(ctx, w, h, t); aurora(ctx, w, h, t);
  mountains(ctx, w, h); lake(ctx, w, h, t); islands(ctx, w, h, t); vessel(ctx, w, h); roots(ctx, w, h, t); gateways(ctx, w, h, t);
}
function sky(ctx, w, h, t) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#05010d"); g.addColorStop(.28, "#170b35"); g.addColorStop(.66, "#062237"); g.addColorStop(1, "#030107");
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.save(); ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < 170; i++) star(ctx, w, h, t, i);
  for (let i = 0; i < 6; i++) comet(ctx, w, h, t, i);
  ctx.restore();
}
function sun(ctx, w, h, t) {
  const x = w * (.78 + Math.sin(t * .08) * .035), y = h * .18;
  const g = ctx.createRadialGradient(x, y, 8, x, y, w * .28);
  g.addColorStop(0, "rgba(255,250,210,.95)"); g.addColorStop(.2, "rgba(255,224,138,.28)"); g.addColorStop(1, "rgba(255,224,138,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}
function aurora(ctx, w, h, t) {
  ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.lineCap = "round";
  ["#8feaff40", "#ff87d73a", "#ffe08a32", "#9dffbc28", "#b7a6ff36", "#ffffff18"].forEach((c, i) => {
    ctx.strokeStyle = c; ctx.lineWidth = 28 + i * 15; ctx.beginPath();
    for (let x = -80; x <= w + 80; x += w / 10) { const y = h * (.15 + i * .052) + Math.sin(t * (1 + i * .1) + x / 142 + i) * (30 + i * 5); x > -80 ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
  }); ctx.restore();
}
function mountains(ctx, w, h) { ridge(ctx, w, h, .47, "rgba(24,18,58,.72)", .035, 6); ridge(ctx, w, h, .55, "rgba(8,34,58,.84)", .06, 9); ridge(ctx, w, h, .63, "rgba(4,10,24,.94)", .088, 13); }
function ridge(ctx, w, h, base, fill, amp, seed) { ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(0, h); for (let x = 0; x <= w; x += w / 11) ctx.lineTo(x, h * base + Math.sin(x / 170 + seed) * h * amp - ((x / w - .5) ** 2) * h * .08); ctx.lineTo(w, h); ctx.fill(); }
function lake(ctx, w, h, t) { const y = h * .66, g = ctx.createLinearGradient(0, y, 0, h); g.addColorStop(0, "rgba(143,234,255,.2)"); g.addColorStop(.5, "rgba(255,224,138,.09)"); g.addColorStop(1, "rgba(3,1,8,.78)"); ctx.fillStyle = g; ctx.fillRect(0, y, w, h - y); ctx.strokeStyle = "rgba(255,255,255,.15)"; for (let i = 0; i < 18; i++) ripple(ctx, w, h, t, y + i * h * .021, i); }
function ripple(ctx, w, h, t, y, i) { ctx.beginPath(); for (let x = 0; x <= w; x += 36) { const yy = y + Math.sin(t * 1.8 + x / 80 + i) * 3.5; x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.stroke(); }
function islands(ctx, w, h, t) { for (let i = 0; i < 7; i++) { const x = w * (.1 + i * .135), y = h * (.27 + (i % 3) * .045 + Math.sin(t + i) * .012); ctx.save(); ctx.shadowBlur = 30; ctx.shadowColor = i % 2 ? "#8feaff" : "#ffe08a"; ctx.fillStyle = "rgba(255,255,255,.13)"; round(ctx, x - 42, y - 10, 84, 22, 18); ctx.fill(); ctx.fillStyle = "rgba(255,224,138,.7)"; ctx.fillRect(x - 2, y - 40, 4, 30); ctx.beginPath(); ctx.arc(x, y - 48, 9, 0, 7); ctx.fill(); ctx.restore(); } }
function vessel(ctx, w, h) { ctx.save(); const x = w * .055, y = h * .13, W = w * .89, H = h * .76; ctx.shadowBlur = 54; ctx.shadowColor = "rgba(255,224,138,.78)"; ctx.fillStyle = "rgba(255,255,255,.072)"; ctx.strokeStyle = "rgba(255,236,168,.76)"; ctx.lineWidth = 5; round(ctx, x, y, W, H, 64); ctx.fill(); ctx.stroke(); ctx.restore(); }
function roots(ctx, w, h, t) { ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.strokeStyle = "rgba(255,224,138,.25)"; for (let i = 0; i < 24; i++) { ctx.lineWidth = 1 + (i % 4) * .55; ctx.beginPath(); const start = w * (.08 + (i % 12) * .078), bottom = h * .89; ctx.moveTo(start, bottom); for (let k = 0; k < 6; k++) ctx.lineTo(start + Math.sin(t + i + k) * 19 + (k - 2) * 17, bottom - k * h * .062); ctx.stroke(); } ctx.restore(); }
function gateways(ctx, w, h, t) { ctx.save(); ctx.globalCompositeOperation = "screen"; for (let i = 0; i < 3; i++) { const x = w * (.24 + i * .25), y = h * .71; ctx.strokeStyle = ["#ffe08a44", "#8feaff44", "#ff87d744"][i]; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y + Math.sin(t + i) * 6, 34 + Math.sin(t * 2 + i) * 3, Math.PI, 0); ctx.stroke(); } ctx.restore(); }
function star(ctx, w, h, t, i) { const x = (i * 97 + t * 12 * (i % 3 + 1)) % w, y = (i * 53 + Math.sin(t + i) * 18) % h; ctx.fillStyle = `rgba(255,255,255,${.035 + (i % 9) / 105})`; ctx.fillRect(x, y, 1.1 + (i % 3) / 2, 1.1 + (i % 3) / 2); }
function comet(ctx, w, h, t, i) { const x = (w * (.16 * i + .1) + t * (25 + i * 11)) % (w + 250) - 125, y = h * (.1 + i * .065) + Math.sin(t + i) * 24; ctx.strokeStyle = ["#ffe08a66", "#8feaff60", "#ff87d766"][i % 3]; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 75, y + 20); ctx.stroke(); }
