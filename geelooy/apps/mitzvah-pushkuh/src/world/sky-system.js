// B"H
// The sky remembers long arcs: moon, meteors, eclipse, and living stars.
import { pulse } from "./wave.js";
export function createSkySystem() {
  let meteor = 0;
  function update(t, q) { meteor = q.emergency ? 0 : (meteor + .012) % 1; return { eclipse: pulse(t * .035, 4, .5, .5), meteor }; }
  function draw(ctx, w, h, t, q, atlas) {
    if (q.emergency) return; const s = update(t, q); ctx.save(); ctx.globalCompositeOperation = "lighter";
    moon(ctx, w, h, s.eclipse); const n = q.mobile ? 3 : 6; for (let i = 0; i < n; i++) starRune(ctx, w, h, t, i);
    if (atlas?.beam) ctx.drawImage(atlas.beam, w * s.meteor - 80, h * .09 + pulse(t, 8, 18), 130, 14); ctx.restore();
  }
  return { update, draw };
}
function moon(ctx, w, h, e) { ctx.fillStyle = `rgba(255,224,138,${.16 + e * .12})`; ctx.beginPath(); ctx.arc(w * .78, h * .17, Math.max(10, w * .035), 0, 7); ctx.fill(); }
function starRune(ctx, w, h, t, i) { ctx.strokeStyle = ["#8feaff55", "#ff87d755", "#ffe08a55"][i % 3]; const x = w * (.14 + i * .13), y = h * (.13 + pulse(t * .2, i, .04, 0)); ctx.strokeRect(x, y, 10 + i, 10 + i); }
