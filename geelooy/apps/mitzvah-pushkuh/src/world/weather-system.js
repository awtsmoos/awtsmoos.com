// B"H
// Weather is cheap atmosphere: lines, dust, lightning, and wind.
import { pulse } from "./wave.js";
export function createWeatherSystem() {
  let wind = .25, mode = "dust";
  function set(next) { mode = next || mode; }
  function update(t) { wind = pulse(t * .08, 2, .35, .55); return { wind, mode }; }
  function draw(ctx, w, h, t, q) {
    if (q.emergency) return; const s = update(t); ctx.save(); ctx.globalCompositeOperation = "lighter";
    s.mode === "rain" ? rain(ctx, w, h, t, s.wind, q) : dust(ctx, w, h, t, s.wind, q); lightning(ctx, w, h, t); ctx.restore();
  }
  return { set, update, draw };
}
function rain(ctx, w, h, t, wind, q) { ctx.strokeStyle = "#8feaff3d"; for (let i = 0; i < (q.mobile ? 20 : 42); i++) { const x = (i * 61 + t * 180 * wind) % w, y = (i * 89 + t * 260) % h; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 10 * wind, y + 24); ctx.stroke(); } }
function dust(ctx, w, h, t, wind, q) { ctx.fillStyle = "#ffe08a30"; for (let i = 0; i < (q.mobile ? 18 : 36); i++) ctx.fillRect((i * 83 + t * 40 * wind) % w, h * (.2 + (i % 7) * .09), 2, 2); }
function lightning(ctx, w, h, t) { if (pulse(t * .07, 9, 1, 0) < .97) return; ctx.strokeStyle = "#ffffff88"; ctx.beginPath(); ctx.moveTo(w * .64, 0); ctx.lineTo(w * .58, h * .18); ctx.lineTo(w * .62, h * .28); ctx.stroke(); }
