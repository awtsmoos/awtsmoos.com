//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the hit spark vessel in this instant, revealing
 * its focused js render v3 effects service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — V3 tiny hit spark only; never covers body. */
export function drawHitSpark(ctx, f, p, color) {
	if (!f.stun || f.stun < 4) return;
	ctx.save();
	ctx.globalAlpha = 0.45;
	ctx.strokeStyle = color;
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(p.chest.x - 8, p.chest.y - 4);
	ctx.lineTo(p.chest.x + 8, p.chest.y + 4);
	ctx.moveTo(p.chest.x + 8, p.chest.y - 4);
	ctx.lineTo(p.chest.x - 8, p.chest.y + 4);
	ctx.stroke();
	ctx.restore();
}
