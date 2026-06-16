/** B"H — V3 attached neck. */
import { V3_STYLE } from '../CharacterStyle.js';
import { roundRect } from './Shape.js';
export function drawNeck(ctx, p, mat) {
  ctx.fillStyle = mat.shell; ctx.strokeStyle = mat.accent; ctx.lineWidth = 2;
  roundRect(ctx, p.neck.x - V3_STYLE.neck.w / 2, p.neck.y - 1, V3_STYLE.neck.w, V3_STYLE.neck.h, 8); ctx.fill(); ctx.stroke();
}
