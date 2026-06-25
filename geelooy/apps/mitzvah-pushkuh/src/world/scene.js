// B"H
// Insane moving light, cheap because it rides cached sprites and a tiny buffer.
export function drawScene(ctx, w, h, t, q = {}, layers = {}, tools = {}) {
  layers.bg ? ctx.drawImage(layers.bg, 0, 0) : ctx.clearRect(0, 0, w, h);
  if (!q.emergency) { beams(ctx, w, h, t, q, tools.atlas); gates(ctx, w, h, t, q, tools); water(ctx, w, h, t, q); }
}
function beams(ctx, w, h, t, q, atlas) {
  if (!atlas?.beam) return; ctx.save(); ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < q.bands + 1; i++) { const y = h * (.16 + i * .09) + Math.sin(t * 1.2 + i) * 18; ctx.globalAlpha = .25 + i * .06; ctx.drawImage(atlas.beam, (Math.sin(t + i) * .12 - .05) * w, y, w * 1.1, 18 + i * 4); }
  ctx.restore();
}
function gates(ctx, w, h, t, q, tools) {
  const light = tools.light; if (!light) return; light.beam(w * .07, h * .66, w * .86, 8, "#8feaff");
  for (let i = 0; i < q.portals + 1; i++) { const x = w * (.18 + i * .2), y = h * .72, r = 22 + Math.sin(t * 2 + i) * 3; light.spark(x, y, i % 2 ? "#ff87d7" : "#ffe08a", 18); tools.atlas?.diamond && draw(ctx, tools.atlas.diamond, x - r, y - r, r * 2, r * 2); }
}
function water(ctx, w, h, t, q) {
  ctx.save(); ctx.strokeStyle = "#ffffff30"; for (let i = 0; i < q.ripples + 1; i++) { const y = h * (.69 + i * .035); ctx.beginPath(); ctx.moveTo(w * .08, y); ctx.lineTo(w * .92, y + Math.sin(t * 2 + i) * 4); ctx.stroke(); } ctx.restore();
}
function draw(ctx, img, x, y, w, h) { ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.drawImage(img, x, y, w, h); ctx.restore(); }
