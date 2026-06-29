// B"H
// Vegetation bends with wind and flowers answer hidden seasons.
import { pulse } from "./wave.js";
export function createVegetationSystem() {
  function draw(ctx, w, h, t, q, wind = .5) {
    if (q.emergency) return; ctx.save(); ctx.globalCompositeOperation = "lighter"; grass(ctx, w, h, t, q, wind); flowers(ctx, w, h, t, q); ctx.restore();
  }
  return { draw };
}
function grass(ctx, w, h, t, q, wind) {
  ctx.strokeStyle = "#9dffbc55"; const n = q.mobile ? 18 : 34;
  for (let i = 0; i < n; i++) { const x = w * (.06 + i / n * .88), y = h * .88, bend = pulse(t * 1.4, i, 7 * wind); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + bend, y - 18 - (i % 5)); ctx.stroke(); }
}
function flowers(ctx, w, h, t, q) {
  ctx.fillStyle = "#ff87d788"; const n = q.mobile ? 6 : 12;
  for (let i = 0; i < n; i++) { const r = 2 + pulse(t * .7, i, 1, 1), x = w * (.12 + i / n * .76), y = h * (.82 + (i % 3) * .018); ctx.fillRect(x - r, y - r, r * 2, r * 2); }
}
