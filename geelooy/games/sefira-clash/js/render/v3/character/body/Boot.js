/** B"H — V3 boot, smaller planted foot. */
import { V3_STYLE } from '../CharacterStyle.js';
export function drawBoot(ctx, foot, sign, mat) { ctx.save(); ctx.translate(foot.x,foot.y); ctx.rotate(sign*.04); ctx.fillStyle=mat.accent; ctx.strokeStyle=mat.ink; ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(sign*3,0,V3_STYLE.boot.rx,V3_STYLE.boot.ry,0,0,Math.PI*2); ctx.fill(); ctx.stroke(); ctx.restore(); }
