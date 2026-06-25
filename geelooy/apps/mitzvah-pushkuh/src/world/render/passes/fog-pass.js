// B"H
// Fog pass scrolls cached atmosphere.
import { pulse } from "../../wave.js";
export const fogPass = () => (ctx, s) => { if (!s.layers.fog || s.q.emergency) return; const x = pulse(s.t * .18, 3, 18), y = pulse(s.t * .13, 4, 5); ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = .72; ctx.drawImage(s.layers.fog, x, y); ctx.drawImage(s.layers.fog, x > 0 ? x - s.w : x + s.w, y); ctx.restore(); };
