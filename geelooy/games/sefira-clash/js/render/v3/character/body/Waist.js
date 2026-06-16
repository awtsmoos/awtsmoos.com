/** B"H — V3 waist accent. */
export function drawWaist(ctx, p, mat) { ctx.save(); ctx.strokeStyle = mat.accent; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(p.leftHip.x - 8, p.leftHip.y + 4); ctx.lineTo(p.rightHip.x + 8, p.rightHip.y + 4); ctx.stroke(); ctx.restore(); }
