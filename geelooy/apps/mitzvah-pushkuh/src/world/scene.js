// B"H
// The scene now breathes over cached heavens: faster, deeper, stranger.

export function drawScene(ctx, w, h, t, q = {}, layers = {}) {
  if (layers.bg) ctx.drawImage(layers.bg, 0, 0); else fallback(ctx, w, h);
  nebula(ctx, w, h, t); aurora(ctx, w, h, t, q); ripples(ctx, w, h, t, q);
  roots(ctx, w, h, t, q); gateways(ctx, w, h, t, q); comets(ctx, w, h, t, q);
  if (layers.glow) { ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = .7 + Math.sin(t) * .08; ctx.drawImage(layers.glow, 0, 0); ctx.restore(); }
}
function fallback(ctx, w, h) { const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#05010d"); g.addColorStop(1, "#020006"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); }
function nebula(ctx, w, h, t) {
  ctx.save(); ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < 5; i++) { const x = w * (.18 + i * .18 + Math.sin(t * .09 + i) * .035), y = h * (.2 + (i % 3) * .18);
    const g = ctx.createRadialGradient(x, y, 1, x, y, w * (.16 + i * .018));
    g.addColorStop(0, ["#8feaff20", "#ff87d724", "#ffe08a1c"][i % 3]); g.addColorStop(1, "#0000"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); }
  ctx.restore();
}
function aurora(ctx, w, h, t, q) {
  ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.lineCap = "round";
  ["#8feaff42", "#ff87d73b", "#ffe08a35", "#9dffbc2d", "#b7a6ff28"].slice(0, q.mobile ? 3 : 5).forEach((c, i) => {
    ctx.strokeStyle = c; ctx.lineWidth = 20 + i * 11; ctx.beginPath();
    for (let x = -80; x <= w + 80; x += w / 7) { const y = h * (.14 + i * .052) + Math.sin(t * (.8 + i * .12) + x / 135 + i) * (22 + i * 4); x > -80 ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
  }); ctx.restore();
}
function ripples(ctx, w, h, t, q) { ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.strokeStyle = "rgba(255,255,255,.16)"; for (let i = 0; i < (q.ripples || 10); i++) { const y = h * (.67 + i * .026); ctx.globalAlpha = .25 + i * .025; ctx.beginPath(); for (let x = 0; x <= w; x += 54) { const yy = y + Math.sin(t * 1.7 + x / 84 + i) * 3; x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.stroke(); } ctx.restore(); }
function roots(ctx, w, h, t, q) { ctx.save(); ctx.globalCompositeOperation = "screen"; ctx.strokeStyle = "rgba(255,224,138,.24)"; for (let i = 0; i < (q.roots || 12); i++) { ctx.lineWidth = 1 + (i % 4) * .45; ctx.beginPath(); const s = w * (.08 + (i % 12) * .078), b = h * .89; ctx.moveTo(s, b); for (let k = 0; k < 6; k++) ctx.lineTo(s + Math.sin(t + i + k) * 16 + (k - 2) * 15, b - k * h * .062); ctx.stroke(); } ctx.restore(); }
function gateways(ctx, w, h, t, q) { ctx.save(); ctx.globalCompositeOperation = "screen"; for (let i = 0; i < (q.portals || 4); i++) { const x = w * (.16 + i * .17), y = h * (.7 + (i % 2) * .025); ctx.strokeStyle = ["#ffe08a66", "#8feaff66", "#ff87d766", "#9dffbc55", "#b7a6ff55"][i]; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y + Math.sin(t + i) * 6, 28 + i * 4 + Math.sin(t * 2 + i) * 3, Math.PI, 0); ctx.stroke(); } ctx.restore(); }
function comets(ctx, w, h, t, q) { ctx.save(); ctx.globalCompositeOperation = "screen"; for (let i = 0; i < (q.comets || 3); i++) { const x = (w * (.13 * i + .1) + t * (70 + i * 23)) % (w + 280) - 140, y = h * (.09 + i * .063) + Math.sin(t + i) * 24; ctx.strokeStyle = ["#ffe08a88", "#8feaff7a", "#ff87d77a"][i % 3]; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 85, y + 24); ctx.stroke(); } ctx.restore(); }
