/** B"H — V3 soft charge glow. */
export function drawChargeGlow(ctx, f, p, color) { if (!f.chargeGlow && !f.attack?.fullCharge) return; ctx.save(); ctx.globalAlpha=.12; ctx.strokeStyle=color; ctx.lineWidth=3; ctx.beginPath(); ctx.ellipse(p.chest.x,p.chest.y+40,38,55,0,0,Math.PI*2); ctx.stroke(); ctx.restore(); }
