//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the draw capelet vessel in this instant, revealing
 * its focused js render fighter clothes service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos split vessel: small readable module, visual-only.
 */
export function drawCapelet(ctx, f, color) {
	const c = f.clothState?.cape;
	if (!c?.length) return;
	ctx.save();
	ctx.globalAlpha = 0.22;
	ctx.strokeStyle = color;
	ctx.lineWidth = 14;
	ctx.beginPath();
	ctx.moveTo(c[0].x, c[0].y);
	for (const p of c.slice(1)) ctx.lineTo(p.x, p.y);
	ctx.stroke();
	ctx.restore();
}
