//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the draw cloth strips vessel in this instant, revealing
 * its focused js render fighter clothes service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos split vessel: small readable module, visual-only.
 */
export function drawClothStrips(ctx, f, color) {
	const h = f.clothState?.hem;
	if (!h?.length) return;
	ctx.save();
	ctx.globalAlpha = 0.32;
	ctx.strokeStyle = f.visualStyle?.clothing?.trim || color;
	ctx.lineWidth = 3;
	for (const p of h) {
		ctx.beginPath();
		ctx.moveTo(f.x, f.y - 60);
		ctx.lineTo(p.x, p.y);
		ctx.stroke();
	}
	ctx.restore();
}
