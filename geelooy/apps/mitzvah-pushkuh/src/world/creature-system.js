// B"H
// Small living signs: birds, fireflies, fish, all drawn as tiny cheap marks.
import { pulse } from "./wave.js";
export function createCreatureSystem() {
  function draw(ctx, w, h, t, q) {
    if (q.emergency) return; ctx.save(); ctx.globalCompositeOperation = "lighter"; birds(ctx, w, h, t, q); fireflies(ctx, w, h, t, q); fish(ctx, w, h, t, q); ctx.restore();
  }
  return { draw };
}
function birds(ctx, w, h, t, q) { ctx.strokeStyle = "#ffffff77"; for (let i = 0; i < (q.mobile ? 3 : 6); i++) { const x = (w * (.1 + i * .17) + t * 18) % w, y = h * (.18 + i * .025); ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.lineTo(x, y - 3); ctx.lineTo(x + 5, y); ctx.stroke(); } }
function fireflies(ctx, w, h, t, q) { ctx.fillStyle = "#ffe08a88"; for (let i = 0; i < (q.mobile ? 10 : 20); i++) ctx.fillRect(w * (.08 + (i * 37 % 90) / 100), h * (.45 + (i % 8) * .04) + pulse(t, i, 8), 2, 2); }
function fish(ctx, w, h, t, q) { ctx.fillStyle = "#8feaff55"; for (let i = 0; i < (q.mobile ? 4 : 8); i++) ctx.fillRect((w * (.15 + i * .11) + pulse(t * .6, i, 18)) % w, h * (.74 + (i % 4) * .035), 8, 2); }
