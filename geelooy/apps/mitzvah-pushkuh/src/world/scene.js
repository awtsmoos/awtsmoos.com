// B"H
// The scene conducts sky, weather, water, vegetation, creatures, and light.
import { pulse } from "./wave.js";

export function drawScene(ctx, w, h, t, q = {}, layers = {}, tools = {}) {
  layers.bg ? ctx.drawImage(layers.bg, 0, 0) : ctx.clearRect(0, 0, w, h);
  if (layers.far && !q.emergency) slide(ctx, layers.far, pulse(t * .22, 1, 10), 0, w, h);
  tools.sky?.draw(ctx, w, h, t, q, tools.atlas);
  if (!q.emergency) { beams(ctx, w, h, t, q, tools.atlas); gates(ctx, w, h, t, q, tools); water(ctx, w, h, t, q); }
  tools.water?.draw(ctx, h, q); tools.vegetation?.draw(ctx, w, h, t, q, tools.weatherState?.wind);
  tools.creatures?.draw(ctx, w, h, t, q); tools.weather?.draw(ctx, w, h, t, q);
  if (layers.fog && !q.emergency) slide(ctx, layers.fog, pulse(t * .18, 3, 18), pulse(t * .13, 4, 5), w, h);
}
function beams(ctx, w, h, t, q, atlas) {
  const beams = atlas?.beams; if (!beams) return; ctx.save(); ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < q.bands + 1; i++) { const y = h * (.16 + i * .09) + pulse(t * 1.2, i, 18); ctx.globalAlpha = .24 + i * .06; ctx.drawImage(beams[i % beams.length], pulse(t, i, .12, -.05) * w, y, w * 1.12, 18 + i * 5); }
  ctx.restore();
}
function gates(ctx, w, h, t, q, tools) {
  const light = tools.light, portal = tools.atlas?.portal; if (!light) return; light.beam(w * .07, h * .66, w * .86, 8, "#8feaff");
  for (let i = 0; i < q.portals + 1; i++) { const x = w * (.18 + i * .2), y = h * .72, r = 23 + pulse(t * 2, i, 3); light.spark(x, y, i % 2 ? "#ff87d7" : "#ffe08a", 18); portal && draw(ctx, portal, x - r, y - r, r * 2, r * 2); }
}
function water(ctx, w, h, t, q) {
  ctx.save(); ctx.strokeStyle = "#ffffff30"; for (let i = 0; i < q.ripples + 1; i++) { const y = h * (.69 + i * .035); ctx.beginPath(); ctx.moveTo(w * .08, y); ctx.lineTo(w * .92, y + pulse(t * 2, i, 4)); ctx.stroke(); } ctx.restore();
}
function slide(ctx, img, x, y, w) { ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = .72; ctx.drawImage(img, x, y); ctx.drawImage(img, x > 0 ? x - w : x + w, y); ctx.restore(); }
function draw(ctx, img, x, y, w, h) { ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.drawImage(img, x, y, w, h); ctx.restore(); }
