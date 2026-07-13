//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the draw robe vessel in this instant, revealing
 * its focused js render fighter clothes service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Awtsmoos split vessel: small readable module, visual-only.
 */
export function drawRobe(ctx, f, color) {
	const h = f.clothState?.hem;
	if (!h?.length) return;
	ctx.save();
	ctx.globalAlpha = 0.24;
	ctx.strokeStyle = color;
	ctx.lineWidth = 12;
	draw(ctx, h);
	ctx.restore();
}
function draw(ctx, ch) {
	ctx.beginPath();
	ctx.moveTo(ch[0].x, ch[0].y);
	for (const p of ch.slice(1)) ctx.lineTo(p.x, p.y);
	ctx.stroke();
}
