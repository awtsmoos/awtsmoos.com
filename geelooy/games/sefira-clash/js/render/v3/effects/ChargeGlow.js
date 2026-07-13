//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the charge glow vessel in this instant, revealing
 * its focused js render v3 effects service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — V3 soft charge glow. */
export function drawChargeGlow(ctx, f, p, color) {
	if (!f.chargeGlow && !f.attack?.fullCharge) return;
	ctx.save();
	ctx.globalAlpha = 0.12;
	ctx.strokeStyle = color;
	ctx.lineWidth = 3;
	ctx.beginPath();
	ctx.ellipse(p.chest.x, p.chest.y + 40, 38, 55, 0, 0, Math.PI * 2);
	ctx.stroke();
	ctx.restore();
}
