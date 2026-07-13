//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the stock dots vessel in this instant, revealing
 * its focused js render v3 hud service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/** B"H — V3 stock dots. */
export function drawStockDots(ctx, f, x, y, color) {
	const n = Math.max(0, f.stocks || 0);
	for (let i = 0; i < 3; i++) {
		ctx.globalAlpha = i < n ? 1 : 0.18;
		ctx.fillStyle = i < n ? color : '#fff';
		ctx.beginPath();
		ctx.arc(x + i * 8, y, 2.6, 0, Math.PI * 2);
		ctx.fill();
	}
	ctx.globalAlpha = 1;
}
