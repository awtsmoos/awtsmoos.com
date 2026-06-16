/** B"H — V3 glove, compact not blob. */
import { V3_STYLE } from '../CharacterStyle.js';
export function drawGlove(ctx, h, mat) { ctx.save(); ctx.translate(h.x,h.y); ctx.fillStyle=mat.accent; ctx.strokeStyle=mat.ink; ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(0,0,V3_STYLE.glove.rx,V3_STYLE.glove.ry,-.1,0,Math.PI*2); ctx.fill(); ctx.stroke(); ctx.restore(); }
