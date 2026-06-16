/** B"H — V3 flat shoulder pads. */
export function drawShoulders(ctx, p, mat) { cap(ctx, p.leftShoulder, -1, mat); cap(ctx, p.rightShoulder, 1, mat); }
function cap(ctx, c, sign, mat) { ctx.save(); ctx.translate(c.x + sign * 2, c.y + 5); ctx.rotate(sign * .16); ctx.fillStyle = mat.soft; ctx.strokeStyle = mat.accent; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.ellipse(0,0,11,5.5,0,0,Math.PI*2); ctx.fill(); ctx.stroke(); ctx.restore(); }
