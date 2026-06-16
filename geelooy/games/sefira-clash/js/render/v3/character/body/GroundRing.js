/** B"H — V3 ground ring. */
import { V3_STYLE } from '../CharacterStyle.js';
export function drawGroundRing(ctx, p, color, human) { ctx.save(); ctx.globalAlpha=human?.75:.32; ctx.strokeStyle=color; ctx.lineWidth=human?3:2; ctx.beginPath(); ctx.ellipse(p.pelvis.x, Math.max(p.leftFoot.y,p.rightFoot.y)+4, V3_STYLE.ring.rx, V3_STYLE.ring.ry, 0,0,Math.PI*2); ctx.stroke(); ctx.restore(); }
