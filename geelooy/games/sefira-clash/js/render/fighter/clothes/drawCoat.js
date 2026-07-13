//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the draw coat vessel in this instant, revealing
 * its focused js render fighter clothes service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos split vessel: small readable module, visual-only.
 */
export function drawCoat(ctx, f, color) {
	const h = f.clothState?.hem;
	if (!h?.length) return;
	ctx.save();
	ctx.globalAlpha = 0.28;
	ctx.strokeStyle = color;
	ctx.lineWidth = 7;
	ctx.beginPath();
	ctx.moveTo(f.x - 14, f.y - 92);
	for (const p of h) ctx.lineTo(p.x, p.y);
	ctx.stroke();
	ctx.restore();
}
