//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the offscreen arrow vessel in this instant, revealing
 * its focused js render v3 hud service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — V3 quiet offscreen arrows. */
export function drawOffscreenArrow(ctx, x, y, angle, color) {
	ctx.save();
	ctx.globalAlpha = 0.32;
	ctx.translate(x, y);
	ctx.rotate(angle);
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.moveTo(7, 0);
	ctx.lineTo(-4, -5);
	ctx.lineTo(-2, 0);
	ctx.lineTo(-4, 5);
	ctx.closePath();
	ctx.fill();
	ctx.restore();
}
